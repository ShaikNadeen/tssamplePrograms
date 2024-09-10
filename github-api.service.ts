/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {toast} from 'react-toastify';

import axios, {AxiosResponse} from 'axios';

import {featureFlag} from '@/configurations/feature-flag.config';
import {IBranch, Iowner, IRepository} from '@/redux/slices/types/repositoy.slice.types';

import {IuserGithubData} from '../components/sidebar/github-appmod/repositories-search-list.component';
import {getOrgNameFromEmail} from '../components/utils/getorganizaitonemail';
import {CODE_EDITOR_SERVICE_API_BASE_URL} from '../constants';

export interface IFetchRepoZipballParameters {
	owner?: string;
	repo: string;
	ref: string;
	token: string;
}

const GITHUB_PROXY_BASE_URL = `${CODE_EDITOR_SERVICE_API_BASE_URL}/api/gh/v2`;
const GITHUB_FETCH_REPOS_LIMIT = 10;

const getToken = () => sessionStorage.getItem('git_access_token') || 'null';

async function fetchRepoZipball(parameters: IFetchRepoZipballParameters) {
	const {owner, ref, repo} = parameters;
	const urlParameters = new URLSearchParams({owner: owner || '', repo, ref});
	const url = `${GITHUB_PROXY_BASE_URL}/getzip`;

	try {
		const response = await axios.get<Blob>(url, {
			headers: {
				Accept: 'application/vnd.github+json',
				Authorization: `Bearer ${getToken()}`
			},
			params: urlParameters,
			responseType: 'blob' // Important: Set responseType to 'blob' for binary data
		});

		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.response?.status === 403) {
				toast.error('Permission denied: You may not have permission to get zip');
			} else {
				toast.error('Error while fetching the zip');
			}
		}
		throw error;
	}
}

export const fetchGithubUser = async (githubUserId: string): Promise<IuserGithubData> => {
	const getGithubUserNameUrl = `${GITHUB_PROXY_BASE_URL}/proxy/user/${githubUserId}`;
	const config = {
		headers: {
			Authorization: `Bearer ${getToken()}`
		}
	};
	try {
		const response = await axios.get<{login: string}>(getGithubUserNameUrl, config);
		return {login: response?.data.login};
	} catch (error) {
		if (axios.isAxiosError(error) && error.response?.status === 401) {
			toast.error('Invalid authentication token');
		} else {
			toast.error('Error fetching user data');
		}
		throw error;
	}
};

export const fetchRepositories = async (data: {searchTerm: string; authToken: string; githubUsername: string; showUserRepos?: boolean; email: string}): Promise<IRepository[]> => {
	const orgName = getOrgNameFromEmail(data?.email);
	const orgUrl = `${GITHUB_PROXY_BASE_URL}/proxy/search/repositories?per_page=${GITHUB_FETCH_REPOS_LIMIT}&q=org:${orgName} ${data.searchTerm} in:name`;
	const userUrl = `${GITHUB_PROXY_BASE_URL}/proxy/search/repositories?q=org:${data?.githubUsername} ${data.searchTerm}`;

	const config = {
		maxBodyLength: Number.POSITIVE_INFINITY,
		headers: {
			Authorization: `Bearer ${getToken()}`
		}
	};

	try {
		const showPersonalGithubUserRepos = featureFlag()['showPersonalGithubUserRepos'];
		if (showPersonalGithubUserRepos) {
			const [orgResponse, userResponse] = await Promise.all([axios.get(orgUrl, config), axios.get(userUrl, config)]);

			return [...(userResponse.data?.items || []), ...(orgResponse.data?.items || [])];
		} else {
			const orgResponse = await axios.get(orgUrl, config);

			return orgResponse.data?.items || [];
		}
	} catch (error) {
		if (axios.isAxiosError(error)) {
			if (error.response?.status === 401) {
				toast.error('Please input your pat token to access git repositories');
			} else {
				toast.error('Error fetching repositories');
			}
		} else {
			toast.error('An unexpected error occurred');
		}
		return [];
	}
};

export const fetchAllBranches = async (data: {repository: string; authToken: string; activeOwner: string}): Promise<Array<IBranch>> => {
	let branches: Array<IBranch> = [];
	const config = {
		maxBodyLength: Number.POSITIVE_INFINITY,
		headers: {
			Authorization: `Bearer ${getToken()}`
		}
	};

	const fetchBranchesRecursively = async (page: number, activeOwner: string) => {
		try {
			const url = `${GITHUB_PROXY_BASE_URL}/proxy/repos/${activeOwner}/${data.repository}/branches?per_page=100&page=${page}`;

			const apiResponse = await axios.get<Array<IBranch>>(url, config);
			if (apiResponse.data && apiResponse.data.length > 0) {
				branches = branches.concat(apiResponse.data);

				if (apiResponse.data.length === 100) {
					await fetchBranchesRecursively(page + 1, activeOwner); // Recursive call with next page
				}
			}
		} catch (error) {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 403) {
					toast.error('Permission denied: You may not have permission to view branches for this repository');
				} else {
					console.error('Error fetching branches:', error);
				}
			}
		}
	};

	await fetchBranchesRecursively(1, data.activeOwner);

	return branches;
};

// ---------------- POST API's -------------------------------------------------------------------------------------

// # 1 --------------------------------  creating a TREEE
export interface ITreeEntry {
	path: string;
	mode: '100644';
	type: 'blob';
	content?: string;
}

interface IcreateTreePayload {
	base_tree: string;
	tree: Array<ITreeEntry>;
}
interface IGitHubTreeResponse {
	sha: string;
	url: string;
}
interface IcreateGithubTreeParameters {
	payload: IcreateTreePayload;
	data: {
		repository: string;
		organization?: string;
		token: string;
	};
}

export const createGitHubTree = async ({payload, data}: IcreateGithubTreeParameters): Promise<IGitHubTreeResponse> => {
	const activeOwner = data.organization;
	const URL = `${GITHUB_PROXY_BASE_URL}/post/repos/${activeOwner}/${data.repository}/git/trees`;
	try {
		const response: AxiosResponse<IGitHubTreeResponse> = await axios.post(URL, payload, {
			headers: {
				Authorization: `Bearer ${getToken()}`, // Ensure you have a GitHub token set in your environment variables
				Accept: 'application/vnd.github.v3+json'
			}
		});

		// We only return the sha and url from the full response
		const {sha, url} = response.data;
		return {sha, url};
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			console.error('Error response while creating tree:', error.response.data);
			throw new Error(`GitHub API error: ${JSON.stringify(error.response.data)}`);
		} else {
			console.error('Unexpected error:', error);
			throw new Error('An unexpected error occurred');
		}
	}
};

// # 2:  creating a COMMMITI
interface ICreateCommitPayload {
	message: string;
	tree: string;
	parents: Array<string>;
}
interface IGitHubCommitResponse {
	sha: string;
	url: string;
}
interface IcreateCommmitParameters {
	payload: ICreateCommitPayload;
	data: {
		repository: string;
		organization?: string;
		token: string;
		owner?: string;
	};
}

export const createCommit = async ({payload, data}: IcreateCommmitParameters): Promise<IGitHubCommitResponse> => {
	const URL = `${GITHUB_PROXY_BASE_URL}/post/repos/${data.owner}/${data.repository}/git/commits`;

	try {
		//  CREATE A TREE:

		const response = await axios.post<IGitHubCommitResponse>(URL, payload, {
			headers: {
				// Accept: 'application/vnd.github+json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${getToken()}`
			}
			// params: urlParameters,
			// responseType: 'blob' // Important: Set responseType to 'blob' for binary data
		});

		console.log('Response------>', response);
		return response.data;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			console.error('Error response while creating commit:', error.response.data);
			throw new Error(`GitHub API error: ${JSON.stringify(error.response.data)}`);
		} else {
			console.error('Unexpected error:', error);
			throw new Error('An unexpected error occurred');
		}
	}
};

// # 3:  Attaching the COMMIT refs
interface ICreateRefsForCommitPayload {
	ref: string;
	sha: string;
}
interface IGitHubCommitRefResponse {
	ref: string;
	url: string;
}
interface IcreateRefsParameters {
	payload: ICreateRefsForCommitPayload;
	data: {
		repository: string;
		organization?: string;
		token: string;
	};
}

interface IPublishBranchParameters {
	owner?: string;
	repo: string;
	newBranchName: string;
	baseBranchSha: string;
	token: string;
}

export const createRefsForCommit = async ({payload, data}: IcreateRefsParameters): Promise<IGitHubCommitRefResponse> => {
	const repositoryPath = `/repos/${data.organization}/${data.repository}/git/refs`;

	try {
		const response: AxiosResponse<IGitHubCommitRefResponse> = await axios.post(`${GITHUB_PROXY_BASE_URL}/post${repositoryPath}`, payload, {
			headers: {
				Authorization: `Bearer ${getToken()}`, // Ensure you have a GitHub token set in your environment variables
				Accept: 'application/vnd.github.v3+json'
			}
		});

		// We only return the sha and url from the full response
		const {ref, url} = response.data;
		return {ref, url};
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			console.error('Error response while creating ref:', error.response.data);
			throw new Error(`GitHub API error: ${JSON.stringify(error.response.data)}`);
		} else {
			console.error('Unexpected error:', error);
			throw new Error('An unexpected error occurred');
		}
	}
};

// export const publishGitBranch = async (data: IPublishBranchParameters): Promise<any> => {
// 	try {
// 		// Step 1: Get the reference of the source branch

// 		  // Step 2: Create the new branch
// 		  await axios.post(
// 			`${GITHUB_PROXY_BASE_URL}/repos/${data.owner}/${data.repo}/git/refs`,
// 			{
// 			  ref: `refs/heads/${newBranchName}`,
// 			  sha,
// 			},
// 			{
// 			  headers: {
// 				Authorization: `token ${getToken()}`,
// 			  },
// 			}
// 		  );

// 		// const response: AxiosResponse<IGitHubCommitRefResponse> = await axios.post(`${GITHUB_PROXY_BASE_URL}/post${repositoryPath}`, payload, {
// 		// 	headers: {
// 		// 		Authorization: `Bearer ${getToken()}`, // Ensure you have a GitHub token set in your environment variables
// 		// 		Accept: 'application/vnd.github.v3+json'
// 		// 	}
// 		// });

// 		// // We only return the sha and url from the full response
// 		// const { ref, url } = response.data;
// 		// return { ref, url };
// 	} catch (error) {
// 		if (axios.isAxiosError(error) && error.response) {
// 			console.error('Error response while creating ref:', error.response.data);
// 			throw new Error(`GitHub API error: ${JSON.stringify(error.response.data)}`);
// 		} else {
// 			console.error('Unexpected error:', error);
// 			throw new Error('An unexpected error occurred');
// 		}
// 	}
// };

// #----------------------------

interface IcommitAndDeployChangesPayload {
	stagedFiles: Array<ITreeEntry>;
}
export interface IcommitAndDeployChangesParameters {
	data: {
		repository: string;
		organization?: string;
		token: string;
		baseTreeSha: string;
		parentCommitSha: string;
		commitMessage: string;
		checkoutBranch: string;
		owner?: string;
	};
	payload: IcommitAndDeployChangesPayload;
}
export const commitAndDeployChanges = async ({data, payload}: IcommitAndDeployChangesParameters) => {
	const {checkoutBranch, baseTreeSha, parentCommitSha, commitMessage} = data;

	try {
		// 1 creating a tree
		const {sha: updatedTreeSha} = await createGitHubTree({
			data: {...data},
			payload: {
				// eslint-disable-next-line camelcase
				base_tree: baseTreeSha,
				tree: payload.stagedFiles
			}
		});

		// 2 creating a commit
		const {sha: commitSha} = await createCommit({
			data,
			payload: {
				message: commitMessage,
				parents: [parentCommitSha],
				tree: updatedTreeSha
			}
		});

		// 3. Attaching the commit refs
		const createRefsResponse = await createRefsForCommit({
			data,
			payload: {
				ref: `refs/heads/${checkoutBranch}`,
				sha: commitSha
			}
		});

		return createRefsResponse;
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			console.error('Error response while deploying changes to Git-hub', error.response.data);
			throw new Error(`GitHub API error: ${JSON.stringify(error.response.data)}`);
		} else {
			console.error('Unexpected error:', error);
			throw new Error('An unexpected error occurred');
		}
	}
};

// @Types NEEDS to be ADDED -----------
export const fetchBranchDetails = async (data: {repository: string; authToken: string; branch: string; activeOwner: string}): Promise<any> => {
	const url = `${GITHUB_PROXY_BASE_URL}/proxy/repos/${data?.activeOwner}/${data.repository}/branches/${data.branch}`;
	const config = {
		maxBodyLength: Number.POSITIVE_INFINITY,
		headers: {
			Authorization: `Bearer ${getToken()}`
		}
	};

	return axios
		.get(url, config)
		.then((response) => {
			return response.data;
		})
		.catch((error) => {
			if (axios.isAxiosError(error)) {
				if (error.response?.status === 403) {
					toast.error('Permission deined');
				} else {
					toast.error('Error fetching branch details');
					console.error('Error fetching branch details', error);
				}
			}
			return [];
		});
};

// # 4:  Raising a PR
interface IRaisePullRequestPayload {
	title: string;
	body: string;
	head: string; // current branch
	base: string; // base branch
}
interface IRaisePullRequestRespoonse {
	html_url: string;
	url: string;
}
interface IRaisePullRequestParametes {
	payload: IRaisePullRequestPayload;
	data: {
		repository: string;
		organization?: string;
		token: string;
	};
}

interface IFetchLanguagesStatsParameters {
	repo: string;
	owner: Iowner;
	token: string;
}

interface IFetchLanguagesStatsResponse {
	[key: string]: number;
}

export const raisePullRequest = async ({payload, data}: IRaisePullRequestParametes): Promise<IRaisePullRequestRespoonse> => {
	const repositoryPath = `repos/${data.organization}/${data.repository}/pulls`;

	try {
		const response: AxiosResponse<IRaisePullRequestRespoonse> = await axios.post(`${GITHUB_PROXY_BASE_URL}/post/${repositoryPath}`, payload, {
			headers: {
				Authorization: `Bearer ${getToken()}`, // Ensure you have a GitHub token set in your environment variables
				Accept: 'application/vnd.github.v3+json'
			}
		});

		// We only return the sha and url from the full response
		// eslint-disable-next-line camelcase
		const {html_url, url} = response.data;
		// eslint-disable-next-line camelcase
		return {html_url, url};
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			console.error('Error response while creating ref:', error.response.data);
			throw new Error(`GitHub API error: ${JSON.stringify(error.response.data)}`);
		} else {
			console.error('Unexpected error:', error);
			throw new Error('An unexpected error occurred');
		}
	}
};

export function convertToGitHubAPIUrl(url: string, branch: string) {
	// Extract owner, repository name, and branch from the provided URL and branch
	const regex = /^https?:\/\/github\.com\/([^/]+)\/([^/]+)\.git$/;
	const match = url.match(regex);
	if (!match) {
		throw new Error('Invalid GitHub repository URL');
	}
	const owner = match[1];
	const repo = match[2];

	// Construct the GitHub API URL
	const apiUrl = `https://api.github.com/repos/${owner}/${repo}/branches/${branch}`;
	return apiUrl;
}

// @Types NEEDS to be ADDED -----------
export const fetchLanguagesStats = async (data: IFetchLanguagesStatsParameters): Promise<IFetchLanguagesStatsResponse> => {
	const owner = data.owner.login;

	const URL = `${GITHUB_PROXY_BASE_URL}/proxy/repos/${owner}/${data.repo}/languages`;
	try {
		const apiResponse = await axios.get(URL, {
			headers: {
				Authorization: `Bearer ${getToken()}`
				// Accept: 'application/vnd.github.v3+json'
			}
		});

		return apiResponse.data;
	} catch (error) {
		throw new Error(error as string);
	}
};

export default fetchRepoZipball;

/* eslint-disable camelcase */
import axios, {AxiosRequestConfig} from 'axios';

import {encodeBase64} from '@/shared/utils/encoding.util';

import {toast} from '../components/shadcn-components/ui/use-toast';
import {returnBackendUrl} from './const.service';
import {
	ApiRepoAnalyseResponse,
	IAssignCsToProjectPayload,
	IAssignCsToProjectResponse,
	ICreateProjectReportPayload,
	ICreateProjectReportResponse,
	IFeedbackData,
	IFetchFileDependenciesParameters,
	IFileDependenciesAPIResponse,
	IFileOfProject,
	IGetAllFilesOfProjectParameters,
	IUpdateFeatureHierarchyResponse,
	IUpdateFeaturesHierarchyParameters,
	ModuleBranchCreationPayload
} from './types/project-analysis.types';
import { ITaskStats } from '@/pages/user-mode/code-conversion/bulk/components/use-bulk-conversion-polling';

const DEV_APPMOD_BASE_URL = import.meta.env?.['VITE_PROJECT_ANALYSER_BASE_URL'] as string;
const APPMOD_BASE_URL = import.meta.env?.['VITE_AI_BASE_URL'] as string;

const fetchRepoAnalyseData = async (taskId: string, userId: string, signal: AbortSignal, accessToken: string): Promise<{data: ApiRepoAnalyseResponse; status: number}> => {
	const URL = `${DEV_APPMOD_BASE_URL}/analyzer/get_project_summary_data`;

	const config: AxiosRequestConfig = {
		params: {task_id: taskId, user_id: userId, git_token: accessToken},
		signal // Pass the AbortSignal to the request configuration
	};
	const response = await axios.get<ApiRepoAnalyseResponse>(URL, config);

	return {data: response.data, status: response.status};
};

interface ISendEmailServiceApiPayload {
	user_id: string;
	task_id: string;
	email_status: boolean;
	email_id: string;
}

interface ServiceFile {
    associated_files: string[];
    description: string;
    name: string;
    service_class: string;
    service_type: string;
}
interface IusedServiceNames {
    service_names: ServiceFile[];
}

interface ServicesUsedPayload{
	
	task_id: string;
	user_id: string;
	git_token: string;
}
interface CustomerServiceApiPayload {
	user_id: string;
	task_id: string;
	name: string;
	user_email: string;
}
export interface ICreateModuleBranchPayload {
	file_path: Array<{
		file_path: string;
		git_url: string;
	}>;
	branch_name: string;
}
interface getBranchesProps {
	repo: string;
	owner: string;
	accessToken: string;
}
interface Branch {
	name: string;
	commit: {
		sha: string;
		url: string;
	};
	protected: boolean;
}

export interface IModuleDataForSubFeature{
	file_path:string;
	git_url:string;
	branch:string;
}
export interface IModuleDataForSubFeatureProps{
	data: IModuleDataForSubFeature[],
	gitAccessToken:string;
}

export interface IModuleDirectoryGeneration{
	source_language:string;
	source_language_version:string;
	target_language:string;
	target_language_version:string;
	framework:string;
	userPrompt?:string;
	feedback?:boolean;
}


/**
 * Schedules an email on the completion of the corresponding ingestion task.
 *
 * @param {Object} payload - The payload containing user ID, task ID, and email ID.
 * @param {string} payload.user_id - The ID of the user.
 * @param {string} payload.task_id - The ID of the task.
 * @param {string} payload.email_id - The email ID to which the email should be sent.
 * @returns {Promise<{message: string}>} The response from the API with a message.
 */
const sendEmailService = async ({user_id, task_id, email_id}: Omit<ISendEmailServiceApiPayload, 'email_status'>): Promise<{message: string}> => {
	// const URL = `https://dev-appmod.techo.camp/api/set_email_status`;
	const URL = `${DEV_APPMOD_BASE_URL}/analyzer/set_email_status`;
	const payload: ISendEmailServiceApiPayload = {
		user_id,
		task_id,
		email_status: true,
		email_id
	};

	const response = await axios.post<{message: string}>(URL, payload);
	return response.data;
};

export const getBranches = async ({ repo, owner, accessToken }: getBranchesProps) => {
	try {
		
		let branches: Array<string> = [];
		const config = {
			maxBodyLength: Number.POSITIVE_INFINITY,
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		};
		const URL = `https://api.github.com/repos/${owner}/${repo}`;
				const response = await axios.get(URL, {
					headers: {
						Authorization: `Bearer ${accessToken}`
					}
				});
				const defaultBranch = response.data.default_branch as string;
		const fetchBranchesRecursively = async (page: number, activeOwner: string) => {
			try {
				
				if (response.status === 200) {
					const url = `https://api.github.com/repos/${owner}/${repo}/branches?per_page=100&page=${page}`;

					const apiResponse = await axios.get(url, config);
					if (apiResponse.data ) {

						branches = [...branches, ...(apiResponse.data as Branch[]).map((object)=>object.name)];

						if (apiResponse.data.length === 100) {
							await fetchBranchesRecursively(page + 1, activeOwner); // Recursive call with next page
						}
					}
					
				}
			} catch {
				toast({
					title: 'Failed to fetch branches. Please try again',
					variant: 'error'
				});
				return ;
			}
		};

		await fetchBranchesRecursively(1, owner);
		if(branches.length>0)
		return {defaultBranch,branches};
		
	} catch {
		toast({
			title: 'Failed to fetch branches. Please try again',
			variant: 'error'
		});
	}
};

const sendCustomerServiceEmail = async ({user_id, task_id, name, user_email}: CustomerServiceApiPayload) => {
	const URL = `${DEV_APPMOD_BASE_URL}/analyzer/send-email-user-support`;

	const payload: CustomerServiceApiPayload = {
		user_id,
		task_id,
		name,
		user_email
	};

	try {
		toast({
			title: 'Your report has been submitted.',
			variant: 'success'
		});
		const response = await axios.post<{message: string}>(URL, payload);
		if (response.status !== 200) {
			toast({
				title: 'Failed to raise a ticket. Please try again',
				variant: 'error'
			});
		}
	} catch {
		throw new Error('Failed to send customer service email');
	}
};

export const submitFeedbackForProjectAnalysis = async (feedbackData: IFeedbackData) => {
	const url = returnBackendUrl().submit_feedback_project_analysis;
	console.log(feedbackData);
	const response = await axios.post<{
		message?: string;
		status?: string;
	}>(url, feedbackData, {});
	return response.data;
};

export const submitFeedbackForFeaturesOverview = async (feedbackData: IFeedbackData) => {
	// https://dev-appmod.techo.camp/analyzer/update-feature-with-feedback
	const url = returnBackendUrl().submit_feedback_project_analysis_features_overview;
	const response = await axios.post<{
		message?: string;
		status?: string;
	}>(url, feedbackData);

	return response;
};

export const fetchFileDependencies = async (parameters: IFetchFileDependenciesParameters): Promise<IFileDependenciesAPIResponse> => {
	const url = `${DEV_APPMOD_BASE_URL}/api/github/file_path_imports`;

	const response = await axios.post<IFileDependenciesAPIResponse>(
		url,
		{
			taskid: parameters.taskid,
			file_path: parameters.file_path,
			repo_url: parameters.repo_url,
			content: true,
			summary: true
		},
		{
			headers: {Authorization: `Bearer ${parameters.token}`},
			withCredentials: true
		}
	);

	return response.data;
};

export const updateFeaturesHierarchy = async (parameters: IUpdateFeaturesHierarchyParameters): Promise<IUpdateFeatureHierarchyResponse> => {
	const url = `${DEV_APPMOD_BASE_URL}/analyzer/user_edit_feature`;

	const response = await axios.post<IUpdateFeatureHierarchyResponse>(url, parameters);

	return response.data;
};

export interface EditSummaryParameters {
	taskId: string;
	userId: string;
	view: 'dashboard' | 'feature';
	editedSummary: string;
}


export interface EditSummaryResponse {
	// Define the response shape here, if you have a specific structure
	success: boolean;
	message?: string;
}

const updateEditedSummaryService = async ({taskId, userId, view, editedSummary}: EditSummaryParameters): Promise<EditSummaryResponse> => {
	const API_URL = `${DEV_APPMOD_BASE_URL}/analyzer/user-edit-summary`;
	try {
		const response = await axios.post<EditSummaryResponse>(
			API_URL,
			{
				task_id: taskId,
				user_id: userId,
				view: view,
				edited_summary: editedSummary
			},
			{
				headers: {
					'Content-Type': 'application/json'
				}
			}
		);

		return response.data;
	} catch (error) {
		// Handle the error as needed
		const error_ = axios.isAxiosError(error) && error.response ? new Error(`Error: ${error.response.data.message}`) : new Error('An unexpected error occurred');
		throw error_;
	}
};

export const getAllFilesOfProject = async (parameters: IGetAllFilesOfProjectParameters): Promise<Array<IFileOfProject>> => {
	// const url = `${DEV_APPMOD_BASE_URL}/analyzer/getAllFiles?task_id=${params.task_id}`;
	const url = `${DEV_APPMOD_BASE_URL}/api/github/get_files?taskid=${parameters.task_id}`;
	const res = await axios.get<Array<IFileOfProject>>(url);

	const convertApiResponseFormatToUIFriendlyFormat = (files: unknown): IFileOfProject[] => {
		const fileResponseStructureToSend: Array<IFileOfProject> = [];

		for (const repoUrl in files || {}) {
			if (Object.prototype.hasOwnProperty.call(files, repoUrl)) {
				// @ts-ignore
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				const filePaths = files[repoUrl];
				for (const filePath of filePaths) {
					fileResponseStructureToSend.push({
						// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
						path: filePath.path,
						git_url: repoUrl
					});
				}
			}
		}

		return fileResponseStructureToSend;
	};

	// const res = {
	// 	data: [
	// 		{
	//             path: 'path/to/file1.js',
	//             git_url: 'https://github.com/repo'
	//         },
	//         {
	//             path: 'path/to/different/file2.js',
	//             git_url: 'https://github.com/repo'
	//         },
	//         {
	// 			path: 'something/else/to/another/file3.js',
	//             git_url: 'https://github.com/repo'
	// 		},
	// 		{
	// 			path: 'something/else/to/another/changed/file3.js',
	//             git_url: 'https://github.com/repo2'
	// 		}
	// 	]
	// }

	// return res.data;

	const responseData = convertApiResponseFormatToUIFriendlyFormat(
		// @ts-ignore
		res.data.files
	);
	return responseData;
};

interface ProjectIngestionServiceProps {
	projectName?: string;
	taskId: string;
	userId: string;
	reposList?: Array<string>; // Optional field
	batchSize?: number; // Optional field
	zipData?: Blob; // Optional field
	regenerate?: boolean;
	gitAccessToken: string;
	egptToken: string;
}

// Project Ingestion Service Function
const projectIngestionRegenService = async ({reposList, regenerate, projectName, batchSize, zipData, egptToken, gitAccessToken, taskId, userId}: ProjectIngestionServiceProps) => {
	try {
		// Show initial loading toast notification

		// Define the ingestion URL
		const githubIngestionUrl = `${DEV_APPMOD_BASE_URL}/analyzer/ingest-project-summary`;

		// Generate FormData with compulsory and optional fields
		const formData = new FormData();

		//   Compulsory fields
		formData.append('task_id', taskId);
		formData.append('user_id', userId);

		// Optional fields
		if (reposList) {
			formData.append('github_info', JSON.stringify(reposList));
		}
		if (reposList) {
			formData.append('project_name', JSON.stringify(projectName));
		}
		if (regenerate) {
			formData.append('regenerate', JSON.stringify(regenerate));
		}
		if (zipData) {
			formData.append('text_pdf_files', zipData);
		}
		if (batchSize !== undefined) {
			formData.append('batch_size', batchSize.toString());
		}

		// Generate headers
		const headers: AxiosRequestConfig['headers'] = {
			'git-access-token': gitAccessToken,
			'egpt-token': `Bearer ${egptToken}`,
			'Content-Type': 'multipart/form-data'
		};
		// Make the API request
		const ingestionResponse = await axios.post<{
			user_id: string;
			task_id: string;
			status: boolean;
			error?: string;
		}>(githubIngestionUrl, formData, {
			withCredentials: true,
			headers
		});

		return ingestionResponse.data;
	} catch (error) {
		if (error instanceof Error) {
			throw new TypeError(error.message || ('An error occurred while regnerating the  Analysis report.' as string));
		}
		console.error(error);
		sessionStorage.removeItem('contextInfoId');
	}
};

const redirectToOpenInVsCodeService = ({repoURL, taskId, userId, filePath, gitToken}: {repoURL: string; userId: string; taskId: string; gitToken: string; filePath?: string}) => {
	const BASE_URL = (import.meta.env['VITE_COPILOT_EXTENSION_BASE_URL'] as string) ?? '';
	// const gitTokenEncoded = '';
	const urlParameters = new URLSearchParams({
		repo_url: repoURL,
		task_id: taskId,
		user_id: userId,
		git_token: encodeBase64(gitToken)
	});
	if (filePath) urlParameters.set('file_path', filePath);
	window.open(`${BASE_URL}?${urlParameters.toString()}`, '_blank', 'noopener,noreferrer');
};
export const createModuleBranchProjectAnalyser = async (payload: ICreateModuleBranchPayload, gitAccessToken: string) => {
	const createModuleBranchUrl = `${APPMOD_BASE_URL}/analyzer/create_module_branch`;
	const config = {
		headers: {
			'git-access-token': gitAccessToken,
			'Content-Type': 'application/json'
		}
	};
	const apiResponse = await axios.post(createModuleBranchUrl, payload, config);
	return apiResponse.data;
};



const createServicesUsedResponse = async ({ task_id, git_token, user_id }: ServicesUsedPayload) => {
	const URL = `${APPMOD_BASE_URL}/analyzer/get_project_services`;
  
	const config = {
	  headers: {
		Authorization: `Bearer ${git_token}`,
		'Content-Type': 'application/json',
	  },
	  params: {
		task_id,
		user_id,
		git_token,
		
	  },
	};
  
	const response = await axios.get<IusedServiceNames>(URL,config);
	
	return response.data;  // Return the data directly
  };
/**
 * Creates a project report by sending the GitHub repository link and project name to the API.
 *
 * @param {Object} payload - The payload containing the GitHub repo link and project name.
 * @param {string[]} payload.github_repo_link - The array of GitHub repository links.
 * @param {string} payload.project_name - The name of the project.
 * @param {string} payload.token - The authorization token for the API request.
 * @returns {Promise<ICreateProjectReportResponse>} The response from the API with project details and a message.
 */
const createProjectReportService = async ({github_repo_link, project_name, token}: ICreateProjectReportPayload) => {
	const URL = `${APPMOD_BASE_URL}/api/create_project_report`;

	const config = {
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		}
	};

	const payload = {
		github_repo_link,
		project_name
	};

	const response = await axios.post<ICreateProjectReportResponse>(URL, payload, config);
	return response.data;
};

/**
 * Assigns a list of customer success IDs to a project and repo URL.
 *
 * @param {IAssignCsToProjectPayload} payload - The payload containing the project name, repo URL, and customer success IDs.
 * @returns {Promise<IAssignCsToProjectResponse>} The response from the API with a message.
 */
const assignCsToProjectService = async ({project_name, repo_url, cs_id}: IAssignCsToProjectPayload) => {
	const URL = `${APPMOD_BASE_URL}/api/assign_cs_to_project`;

	const config = {
		headers: {
			'Content-Type': 'application/json'
		}
	};

	const response = await axios.post<IAssignCsToProjectResponse>(URL, {project_name, repo_url, cs_id}, config);
	return response.data;
};

const projectAnalyserModuleConversionForSubFeature=async(data:ModuleBranchCreationPayload,gitAccessToken:string)=>{
	const URL=`${APPMOD_BASE_URL}/api/module_conversion`;
	const config={
		headers:{
			'git-access-token': gitAccessToken,
			'Content-Type':'application/json'
		}
	};
	const apiResponse=await axios.post(URL,data,config)
	return apiResponse;

}
const moduleConversionDirectoryGeneration=async(payload:IModuleDirectoryGeneration,gitAccessToken:string)=>{
	const URL=`${APPMOD_BASE_URL}/api/directory_generation`;
	const config={
		headers:{
			'git-access-token':gitAccessToken,
			'Content-Type':'application/json'
		}
	};
	const apiResponse=await axios.post(URL,payload,config)
	return apiResponse;
}
const fetchCombinedDataForModuleConversionAndTestCasePanel = async (taskId: string, userId: string, signal: AbortSignal, accessToken: string): Promise<ITaskStats> => {
  const url = `${import.meta.env.VITE_AI_BASE_URL}/api/combined-task-data`;
  const response = await axios.get(url, {
    params: { taskId, userId },
    headers: { 'Authorization': `Bearer ${accessToken}` },
    signal,
  });
  return response.data;
};

export {createServicesUsedResponse, fetchRepoAnalyseData, assignCsToProjectService, createProjectReportService, redirectToOpenInVsCodeService, projectIngestionRegenService, sendEmailService, updateEditedSummaryService, sendCustomerServiceEmail,projectAnalyserModuleConversionForSubFeature,moduleConversionDirectoryGeneration,fetchCombinedDataForModuleConversionAndTestCasePanel};

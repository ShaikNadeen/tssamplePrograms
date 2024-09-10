import axios, {AxiosResponse} from 'axios';

import {ICodingStandard} from '@/redux/slices/coding-standard.slice';

import {returnBackendUrl} from './const.service';

export const getProjectProfile: (githubUrl: string) => Promise<AxiosResponse<Array<ICodingStandard>>> = async (githubUrl: string) => {
	const url = returnBackendUrl().get_project_profile;

	return axios.post(url, {project_url: githubUrl});
};

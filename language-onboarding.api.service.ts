import axios, { AxiosResponse } from 'axios';

import { VITE_AI_BASE_URL } from '../constants';
import { generateUUID } from '../hooks';

interface IContextInfo {
	contentType: 'local_file' | 'website';
	files: Array<{
		createdTime: string;
		id: string;
		mimeType: string;
		modifiedTime: string;
		name: string;
		size: number;
		rlef_collectionId: string;
		_id: string;
		webViewLink?: string;
	}>;
	_id: string;
	createdAt: string;
	updatedAt: string;
}
export interface AssistantDetails {
	name: string;
	target: string;
	id: string;
	description: string;
	organizationName: string;
	assistant_type: string;
	contextInfo: Array<IContextInfo>;
}

export interface IGeneratePromptFromExamplesAPIParameters {
	language: string;
	description: string;
	usecase: Array<{
		purpose: string;
		example_description: string;
		example_code: string;
	}>;
}

const VITE_NODE_BASE_URL = import.meta.env?.VITE_NODE_BASE_URL as string;

const egptApiClient = axios.create({
	baseURL: VITE_NODE_BASE_URL,
	withCredentials: true
});

interface IcreateNewAssistantApiParameters {
	name: string;
	description: string;
	language: string;
	accessToken: string;
}

interface IDeleteContentFilesAPIParameters {
	name: string;
	organizationName?: string;
	contextInfoIds: Array<string>;
	token: string;
}

const COMPILER_ONBOARDING_URL = import.meta.env['VITE_COMPILER_ONBOARDING_BASE_URL'] as string || '';
export const fetchCompilerLanguages = async (): Promise<AxiosResponse<Array<string>>> => {
	const url = `${COMPILER_ONBOARDING_URL}/compiler/get_langauges`;

	return axios.get(url);
};

export const addCompilerLanguage = async (language: string): Promise<AxiosResponse<any>> => {
	const url = `${COMPILER_ONBOARDING_URL}/compiler/add_language`;

	return axios.post(url, {
		language: language
	});
};

export const createNewAssistant = async (parameters: IcreateNewAssistantApiParameters): Promise<AxiosResponse<any>> => {
	return egptApiClient.post(
		'/api/chatbot/create',
		{
			organizationName: '84lumber',
			name: parameters.name,
			description: parameters.description,
			assistant_type: 'code_converter',
			vector_db: 'alloydb',
			source: 'English',
			target: parameters.language
		},
		{
			headers: {
				Authorization: `Bearer ${parameters.accessToken}`
			}
		}
	);
};

export const getAssistantDetails = async (name: string, token: string, organizationName?: string): Promise<AxiosResponse<AssistantDetails>> => {
	return egptApiClient.get(`/api/chatbot/getChatbot?name=${name}&organizationName=${organizationName || '84lumber'}`, {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

export const generatePromptFromExamples = async (parameters: IGeneratePromptFromExamplesAPIParameters): Promise<AxiosResponse<any>> => {
	const url = `${VITE_AI_BASE_URL}/api/get_custom_systemprompt`;

	return axios.post(url, {
		...parameters
	});
};

const buildUpdatePromptApiPayloadFromGetResponse = (data: any, newPrompt: string) => {
	const requestId = generateUUID();
	return {
		name: data.name,
		organizationName: data.organizationName,
		description: data.description,
		assistantDetails: {
			...data.assistantDetails,
			expertise: {
				...data.assistantDetails.expertise,
				description: newPrompt
			}
		},
		context: data.context,
		aiModel: data.aiModel,
		selectedModel: data.selectedModel,
		selectedModelType: data.selectedModelType,
		openaiApiKey: data.openaiApiKey,
		projectId: data.projectId,
		location: data.location,
		llama2ProjectId: data.llama2ProjectId,
		llama2Location: data.llama2Location,
		llama2EndpointName: data.llama2EndpointName,
		requestId: requestId
	};
};

export const updatePromptSetting = async (prompt: string, assistantName: string, token: string): Promise<AxiosResponse<any>> => {
	let assistantDetails;

	try {
		assistantDetails = await getAssistantDetails(assistantName, token);
		assistantDetails = assistantDetails.data;
	} catch (error) {
		console.error(error);
		throw new Error('Error in fetching assistant details');
	}

	return egptApiClient.post('/api/chatbot/promptSettings', buildUpdatePromptApiPayloadFromGetResponse(assistantDetails, prompt), {
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
};

export const deleteContentFilesOfAnAssistant = async (parameters: IDeleteContentFilesAPIParameters) => {
	return egptApiClient.post(
		'/api/chatbot/deleteContentFiles',
		{
			name: parameters.name,
			organizationName: parameters.organizationName || '84lumber',
			contextInfoIds: parameters.contextInfoIds
		},
		{
			headers: {
				Authorization: `Bearer ${parameters.token}`
			}
		}
	);
};

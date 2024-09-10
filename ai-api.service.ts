import { toast } from 'react-toastify';

import axios, { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';

import { SelectedAssistantType } from '@/redux/slices/code-refactor-slice';
import { ICodingStandard } from '@/redux/slices/coding-standard.slice';
import { TCompilerData } from '@/redux/slices/compiler.slice';
import { CustomTestCaseGeneratorRunningTestCaseErrorMessage, CustomTestCaseGeneratorRunningTestCaseRunMessage, DEFAULT_CONFIG, egptImageUploadapiHeaders, rlefApiAuthHeaders, streamResponsePostBody } from '@/shared/constants/constants';
import { RequestsCopilot } from '@/typings/message';

import { LanguageTypes } from '../components/interfaces';
import { FileDataType } from '../components/sidebar/sourcetree/interfaces';
import {
	approveCodeInterface,
	approvedCodeRequestParameters,
	approveFeedbackInterface,
	CodingStandardDeleteInterface,
	CompiledAIUnitTestCodeInterface,
	CompiledUnitTestCodeReponseInterface,
	CompiledUnitTestCodeRequestInterface,
	DomainExpertCodeInterface,
	FeedbackInterface,
	GetAnsOfQuestionInterface,
	getCustomTestCaseInterface,
	getCustomTestCaseResponseInterface,
	GetDynamicPromptPayloadInterface,
	GetInputInterface,
	GetStatusOfCodeInterface,
	GetUnitTestCodeRequestInterface,
	GetUnitTestCodeResponseInterface,
	GlossaryDataServiceInterface,
	IcompileAIunitTestCaseResponse,
	SendCopilotInterface,
	sendFileInterface,
	sendToModularTestParametersTypes,
	StreamResponsePostPayloadInterface,
	updateCodeInterface,
	updateModeInterface
} from '../interfaces/apis.interface';
import { RunAllTestCasesOutputInterface } from '../interfaces/code-generation.interface';
import { BACKEND_URL, GENERIC_ERROR_MESSAGE, getAnsOfQuestionApiDomain, getAnsOfQuestionApiDomainCsharp, getRunCustomTestCasesForCodeGeneration, main84LumberUrl, ModularFileDetail, returnBackendUrl } from './const.service';
import { IVulnerabilityReportSonar } from './types/project-analysis.types';
import { getFormattedRequestListData, urlPopulator } from './utils';

interface feedbackData {
	question: string;
	answer: string;
	remarks: string;
	label: string;
	reporter: string;
	violated_function: string;
	appmode_version: string;
	Programming_language: string;
	rlef_url: string;
	rlef_model: string;
}

// TODO: function to hit an endpoint if userId doesn't exist on refresh and returns the user_id

export const backendURL = {
	csharp: `${getAnsOfQuestionApiDomainCsharp}/generate_test_case`,
	python: `${getAnsOfQuestionApiDomain}/unit-test-score`
};

export const getUserId = async () => {
	const URL = `${getAnsOfQuestionApiDomain}/id`;
	// const URL  =   'https://mocki.io/v1/6bd6bf1a-30ca-469c-afc8-3fb4516a9b5f'
	try {
		if (!sessionStorage.getItem('user_id')) {
			const { data } = await axios.get(URL);
			const user_id: string = data.user_id;

			sessionStorage.setItem('user_id', user_id);

			return user_id;
		} else {
			// If user_id exists in sessionStorage, log it
			const existingUserId: string = sessionStorage.getItem('user_id') || '';

			return existingUserId;
		}
	} catch (error) {
		toast.error('Something went wrong please try again later');
	}
};
export const getModularFiles = async () => {
	try {
		const apiResponse = await axios.get(`${ModularFileDetail}`, {
			headers: {
				...rlefApiAuthHeaders
			}
		});
		return apiResponse.data;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		throw new Error('Something went wrong while running the code');
	}
};
// ----
export async function GetAnsOfQuestion(params: GetAnsOfQuestionInterface) {
	const formData = new FormData();
	formData.append('question', params.question);
	formData.append('version', params.modelVersion);

	// getting the userId from local storage  and appending it to formData
	try {
		const user_id = (await getUserId()) || '';
		formData.append('user_id', user_id);
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
	}

	try {
		const apiResponse = await axios.post(`${getAnsOfQuestionApiDomain}/inference`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return apiResponse.data.answer;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		return false;
	}
}
export async function sendFileToStreamlet(params: sendFileInterface) {
	const formData = new FormData();
	formData.append('question', params.question);

	// getting the userId from local storage  and appending it to formData
	try {
		const user_id = (await getUserId()) || '';
		formData.append('user_id', user_id);
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
	}

	try {
		const apiResponse = await axios.post(`${getAnsOfQuestionApiDomain}/convert_to_streamlite`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return apiResponse.data.answer;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		return false;
	}
}

export async function GetModularTest(payload: any) {
	const URL = `${getAnsOfQuestionApiDomain}/moduler_test`;
	axios
		.post(URL, payload, {
			headers: { 'Content-Type': 'application/json' }
		})
		.then((response) => {})
		.catch((error) => {
			console.error(error);
		});
}
/**
 * Error chaeck api service
 * @param params
 * @param currentLanguage
 * @returns
 */
export async function getStatusOfCode(params: GetStatusOfCodeInterface, currentLanguage?: string) {
	const formData = new FormData();

	formData.append('code', params.code);
	formData.append('code_type', params?.code_type || '');
	if (params.file) formData.append('file', params.file);

	try {
		const language: LanguageTypes = (params?.language as LanguageTypes) || 'CBASIC';
		const apiResponse = await axios.post(`${returnBackendUrl().error_check}`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
		if (apiResponse.status != 200) throw Error(apiResponse.data);
		return { response: { ...apiResponse.data, statusCode: apiResponse?.status }, request_params: { ...params } };
	} catch (error: any) {
		throw new Error(error?.response?.data?.answer || error?.response?.data?.error || GENERIC_ERROR_MESSAGE);
	}
}

// @API-call to return all test cases data
export async function getAllTestCases(params: GetStatusOfCodeInterface) {
	const formData = new FormData();
	formData.append('code', params.code);
	if (params?.language) {
		formData.append('language', params.language);
	}
	// getting the userId from local storage  and appending it to formData
	try {
		const user_id = (await getUserId()) || '';

		formData.append('user_id', user_id);
	} catch (error) {
		toast.error('someting went wrong');
		return;
	}

	try {
		const language: LanguageTypes = (params?.language as LanguageTypes) || 'CBASIC';
		const apiResponse = await axios.post(`${returnBackendUrl().unit_test_score}`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		if (!apiResponse?.data?.answer) {
			throw 'Something went wrong while running unit tests';
		}
		return { response: apiResponse.data, request_params: params };
	} catch (error) {
		throw error;
	}
}

export async function getInputParameter(params: GetInputInterface) {
	// console.log('params.code', params.code);

	const formData = new FormData();
	formData.append('code', params.code);

	try {
		// const apiResponse = await axios.get(`${getAnsOfQuestionApiDomain}/input_params?${queryString}`)
		const apiResponse = await axios.post(`${getAnsOfQuestionApiDomain}/input_params`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		});
		return apiResponse.data;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		throw new Error('Something went wrong while running the code');
	}
}

export async function getCustomTestCases(params: getCustomTestCaseInterface): Promise<getCustomTestCaseResponseInterface[] | null> {
	try {
		const apiResponse = await axios.post(`${getAnsOfQuestionApiDomain}/custom-test-case`, params);
		return apiResponse.data;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		return null;
	}
}

export async function getAvailableModels() {
	try {
		const apiResponse = await axios.get(`${getAnsOfQuestionApiDomain}/models`, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return apiResponse.data;
	} catch (err) {
		toast.error(GENERIC_ERROR_MESSAGE);
	}
}

export async function flushApiCall() {
	const existingUserId: string = sessionStorage.getItem('user_id') || '';

	let headersList = {
		Accept: '*/*'
	};

	let formdata = new FormData();
	formdata.append('user_id', existingUserId);

	let bodyContent = formdata;

	let reqOptions = {
		url: `${getAnsOfQuestionApiDomain}/flush`,
		method: 'POST',
		headers: headersList,
		data: bodyContent
	};

	try {
		await axios.request(reqOptions);
	} catch (err) {
		toast.error(GENERIC_ERROR_MESSAGE);
	}
}

export const fetchRequestLists = async (offset: number, rowsperPage: number, code_type: string) => {
	const headerList = {
		headers: {
			...rlefApiAuthHeaders
		}
	};
	//  TODO: changing it to dynamic URL
	const URL = urlPopulator(offset, rowsperPage, code_type);

	try {
		const response = await axios.get<{ totalCount: number; resources: RequestsCopilot[] }>(URL, headerList);
		const { data } = response;

		const parsedResources: RequestsCopilot[] = [];
		data.resources.forEach((value) => {
			try {
				const resourceObject = JSON.parse(value.resource as unknown as string) as RequestsCopilot['resource'];
				parsedResources.push({ ...value, resource: resourceObject });
			} catch (error) {
				console.log('ERROR', error);
			}
		});

		return {
			...data,
			resources: parsedResources.filter((value) => value?.resource !== null)
		};
		// const formatedData = getFormattedRequestListData(res.data);
		// return formatedData;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
	}
};

export async function updateMode(params: updateModeInterface) {
	try {
		const apiResponse = await axios.get(`${getAnsOfQuestionApiDomain}/developermode/${params.developermode}`, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return apiResponse.data;
	} catch (err) {
		toast.error(GENERIC_ERROR_MESSAGE);
	}
}

export async function sendFeedBack(params: FeedbackInterface): Promise<boolean> {
	const formData = new FormData();
	formData.append('remarks', params.remarkData);
	formData.append('question', params.prompt);
	formData.append('answer', params.answer);
	formData.append('label', params.label);
	formData.append('reporter', '');
	formData.append('violated_function', '');
	formData.append('Programming_language', '');
	formData.append('appmode_version', '0.0.2');
	formData.append('rlef_url', `${import.meta.env?.['VITE_RLEF_FEEDBACK_URL']}`);
	formData.append('rlef_model', '66828747f15e778712a9d009');
	try {
		await axios.post(`${getAnsOfQuestionApiDomain}/feedback`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return true;
	} catch {
		toast.error(GENERIC_ERROR_MESSAGE);
		return false;
	}
}

export async function sendCodeToCopilot(params: SendCopilotInterface) {
	const formData = new FormData();
	// formData.append('c_basic', params.c_basic);
	// formData.append('py_code', params.py_code);
	Object.keys(params).forEach((key) => {
		//@ts-ignore
		formData.append(key, params[key as string]);
	});

	try {
		const apiResponse = await axios.post(`${getAnsOfQuestionApiDomain}/ai_copilot`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});

		return apiResponse.data;
	} catch {
		toast.error(GENERIC_ERROR_MESSAGE);
		return false;
	}
}

export async function sendCodeStandardData(data: any) {
	let formdata = new FormData();
	const existingUserId: string = sessionStorage.getItem('user_id') || '';
	formdata.append('feedback', data);

	formdata.append('user_id', existingUserId);

	try {
		let headersList = {
			Accept: '*/*'
		};
		let bodyContent = formdata;
		let reqOptions = {
			url: `${getAnsOfQuestionApiDomain}/promt-feedback`,
			method: 'POST',
			headers: headersList,
			data: bodyContent
		};
		let response = await axios.request(reqOptions);
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		console.error(error);
	}
}

export async function sendUpdatedCode(parameters: updateCodeInterface) {
	const headersList = {
		Accept: '*/*',
		'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
		'Content-Type': 'application/json',
		...rlefApiAuthHeaders
	};

	// const bodyContent = JSON.stringify({
	// 	id: params.id,
	// 	remarks: params.remarks
	// });

	const bodyContent = JSON.stringify({
		code: parameters.code,
		prompt: parameters.prompt,
		mode: parameters.mode,
		copilot_name: 'Expert'
	});

	// const reqOptions: AxiosRequestConfig = {
	// 	url: 'https://autoai-backend-exjsxe2nda-uc.a.run.app/coPilotResource/',
	// 	method: 'PUT',
	// 	headers: headersList,
	// 	data: bodyContent
	// };

	const reqOptions: AxiosRequestConfig = {
		url: `${getAnsOfQuestionApiDomain}/fsp_pair_upload`,
		method: 'POST',
		headers: headersList,
		data: bodyContent
	};

	try {
		const response = await axios.request(reqOptions);

		return response.data;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		return false;
	}
}
export async function approveUpdatedCode(params: approveCodeInterface) {
	const requestBody = {
		id: [params.id],
		status: 'approved',
		label: 'copilot-testing',
		queryParams: {
			offset: '1',
			limit: '1',
			project: '65042ac9bb18ed4e3e21db31',
			status: 'active',
			coPilot: '654921bff33b532439a2bf6b',
			sortOrder: 'ascending',
			sortField: 'resourceTimerEndAt'
		}
	};

	const axiosConfig: AxiosRequestConfig = {
		method: 'put',
		url: 'https://autoai-backend-exjsxe2nda-uc.a.run.app/coPilotResource',
		headers: {
			'Content-Type': 'application/json',
			...rlefApiAuthHeaders
		},
		data: requestBody
	};

	try {
		const apiResponse = await axios(axiosConfig);

		return apiResponse.data;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		return false;
	}
}
export async function getExpertCode(params: approvedCodeRequestParameters) {
	const headersList = {
		Accept: '*/*',
		'User-Agent': 'Thunder Client (https://www.thunderclient.com)',
		'Content-Type': 'application/json',
		...rlefApiAuthHeaders
	};

	const bodyContent = JSON.stringify({
		id: params.id,
		resource: params.resource
	});

	const reqOptions: AxiosRequestConfig = {
		url: 'https://autoai-backend-exjsxe2nda-uc.a.run.app/coPilotResource/',
		method: 'PUT',
		headers: headersList,
		data: bodyContent
	};

	try {
		const response = await axios.request(reqOptions);

		return response.data;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		return false;
	}
}

export async function sendRequestToDomainExpert(params: approveCodeInterface) {
	const headersList = {
		Accept: '*/*',
		'Content-Type': 'application/json',
		...rlefApiAuthHeaders
	};

	const bodyContent = JSON.stringify({
		id: params.id,
		coPilot: '654921bff33b532439a2bf6b'
	});

	const reqOptions: AxiosRequestConfig = {
		url: 'https://autoai-backend-exjsxe2nda-uc.a.run.app/coPilotResource/',
		method: 'PUT',
		headers: headersList,
		data: bodyContent
	};

	try {
		const response = await axios.request(reqOptions);

		return response.data;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		return false;
	}
}

export async function getCopilotModeCode(params: DomainExpertCodeInterface) {
	const headersList = {
		Accept: '*/*',
		'User-Agent': 'Thunder Client (https://www.thunderclient.com)'
	};

	let formdata = new FormData();
	formdata.append('input_statement', params.input_statement);
	let bodyContent = formdata;

	let reqOptions = {
		url: `${getAnsOfQuestionApiDomain}/inference_ai`,
		// url: "http://127.0.0.1:5002/inference_ai",
		method: 'POST',
		headers: headersList,
		data: bodyContent
	};

	try {
		const response = await axios.request(reqOptions);
		// console.log(response.data);
		return response.data;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
		return false;
	}
}
export async function approveFeedBackService(params: approveFeedbackInterface) {
	// console.log("approveFeedbackInterface", params);

	const headersList = {
		Accept: '*/*'
	};
	const bodyContent = JSON.stringify({
		question: params.question,
		answer: params.answer,
		name: '84lumberfeedback',
		organizationName: 'techolution'
	});

	const reqOptions: AxiosRequestConfig = {
		url: `${main84LumberUrl}/chatbot/directPublishFeedback`,
		method: 'POST',
		headers: headersList,
		data: bodyContent
	};

	try {
		const response = await axios.request(reqOptions);

		return response.data;
	} catch (error) {
		throw error;
	}
}

export async function sendToModularTestService(params: sendToModularTestParametersTypes) {
	const headersList = {
		Accept: '*/*'
	};

	// // converting Object to FORM DATA
	let formData = new FormData();
	const keys = Object.keys(params) as Array<keyof sendToModularTestParametersTypes>;
	keys.forEach((key) => {
		formData.append(key, JSON.stringify(params[key]));
	});

	// console.log(formData)
	const bodyContent = formData;

	const reqOptions: AxiosRequestConfig = {
		url: `${getAnsOfQuestionApiDomain}/set-code`,
		method: 'POST',
		headers: headersList,
		data: bodyContent
	};

	try {
		const response = await axios.request(reqOptions);
		toast.success('successfully sent the response to modular test');
		return response.data;
	} catch (error) {
		toast.error(GENERIC_ERROR_MESSAGE);
	}
}

// -------------- Glossary feature service -------------------
export async function sendGlossaryDataService(params: GlossaryDataServiceInterface) {
	const payload = {
		filename: params.filename,
		rules: params.rules,
		scope_option: params.scope_option,
		projects: params.projects,
		selectedTag: params.selectedTag,
		title: params.title,
		selectedlanguages: params.selectedlanguages,
		user_id: params.user_id,
		comment: params.comment,
		severity: params.severity,
		is_active: false
	};

	try {
		const reqOptions: AxiosRequestConfig = {
			url: `${getAnsOfQuestionApiDomain}/add_code_profile`,
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			data: JSON.stringify(payload)
		};

		const { data } = await axios.request(reqOptions);
		return data;
	} catch (error) {
		throw error;
	}
}

export async function updateGlossaryCodingStandard(params: GlossaryDataServiceInterface) {
	const payload = {
		...params,
		is_active: false
	};

	try {
		const reqOptions: AxiosRequestConfig = {
			url: `${getAnsOfQuestionApiDomain}/edit_code_profile`,
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			data: JSON.stringify(payload)
		};

		const { data } = await axios.request(reqOptions);
		return data;
	} catch (error) {
		throw error;
	}
}

export async function deleteGlossaryCodingStandard(params: CodingStandardDeleteInterface) {
	try {
		const reqOptions: AxiosRequestConfig = {
			url: `${getAnsOfQuestionApiDomain}/delete_code_profile?id=${params.id}`,
			method: 'DELETE',
			headers: { 'Content-Type': 'application/json' }
		};

		const { data } = await axios.request(reqOptions);

		return data;
	} catch (error) {
		throw error;
	}
}

//------------------------- csharp specific services
// @API-call to return unit-test-codes and input-output data
export async function getUnitTestCodes(params: Omit<GetUnitTestCodeRequestInterface, 'user_id'>) {
	const formData = new FormData();
	formData.append('code', params.code);
	if (params?.language) {
		formData.append('language', params.language);
	}
	// getting the userId from local storage  and appending it to formData
	try {
		const user_id = (await getUserId()) || '';
		formData.append('user_id', user_id);
	} catch (error) {
		toast.error('someting went wrong');
		return;
	}

	try {
		// const language: LanguageTypes = (params?.language as LanguageTypes) || 'chsarp';
		const response = await axios.post(`${BACKEND_URL['csharp'].generate_unit_test_code}`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		const responseData: GetUnitTestCodeResponseInterface = response.data;
		return { response: responseData, request_params: params };
	} catch (error: any) {
		throw new Error(error?.message || GENERIC_ERROR_MESSAGE);
	}
}

// @API-call to return all test cases data for csharp
export async function getCompiledUnitTestCode(params: CompiledUnitTestCodeRequestInterface) {
	const formData = new FormData();
	formData.append('code', params.code);
	formData.append('generated_test_cases', params.generated_test_cases);
	formData.append('input_output_values', params.input_output_values);
	if (params?.language) {
		formData.append('language', params.language);
	}
	// getting the userId from local storage  and appending it to formData
	try {
		const user_id = (await getUserId()) || '';
		formData.append('user_id', user_id);
	} catch (error) {
		throw new Error('someting went wrong');
	}

	try {
		// const language: LanguageTypes = (params?.language as LanguageTypes) || 'csharp';
		const response = await axios.post(`${BACKEND_URL['csharp'].unit_test_score}`, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});

		const responseData: CompiledUnitTestCodeReponseInterface = response.data;
		return { response: responseData, request_params: params };
	} catch (error: any) {
		throw new Error(error?.response?.data?.message || GENERIC_ERROR_MESSAGE);
	}
}

/**
 * Compiles the Unit test code and gives the result after running it specifally for python
 * @param parameters {} -
 * @returns response
 */
export async function getUnitTestCode(parameters: CompiledAIUnitTestCodeInterface) {
	const formData = new FormData();
	formData.append('language', parameters?.language);
	formData.append('code', parameters.codeInput || '');
	formData.append('test_code', parameters?.unit_test_code);
	formData.append('filename', parameters?.fileName || DEFAULT_CONFIG.fileName);
	const response = await axios.post(returnBackendUrl()?.run_unit_test, formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
	return response;
}

/**
 * Runs unit tests on compiled AI code.
 * @param {Object} params - Parameters for running unit tests.
 * @param {string} params.language - The programming language of the AI code.
 * @param {string} params.codeInput - The compiled AI code to be tested.
 * @param {string} params.unit_test_code - The unit test code for the AI code.
 * @returns {Promise<Response>} - A promise resolving to the response from the backend server.
 */
export async function getCompiledAIUnitTestCode(parameters: CompiledAIUnitTestCodeInterface) {
	const formData = new FormData();
	formData.append('language', parameters?.language);
	formData.append('code', parameters?.codeInput as string);
	formData.append('test_code', parameters?.unit_test_code);
	formData.append('filename', parameters?.fileName || DEFAULT_CONFIG.fileName);
	const response = await axios.post<IcompileAIunitTestCaseResponse>(returnBackendUrl()?.run_unit_test, formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
	return response;
}

export const streamResponsePost = (payload: StreamResponsePostPayloadInterface, selectedAssistant: SelectedAssistantType, mode?: string) => {
	const streamPostPayload = {
		...streamResponsePostBody,
		name: selectedAssistant?.codeAssistant,
		organizationName: selectedAssistant?.organizationName,
		customPrompt: payload?.customPrompt || ''
	};
	if (mode) {
		streamPostPayload.name = selectedAssistant?.testAssistant;
	}

	const streamPostUrl = returnBackendUrl().stream_post;
	// let streamPostUrl = `${main84LumberUrl}/chat/streamResponsePost`;
	const response = axios.post(streamPostUrl, {
		...payload,
		...streamPostPayload
	});
	return response;
};

interface IAssitantData {
	sourceLanguage: string;
	outputLanguage: string;
	codeAssistant: string;
	organizationName: string;
	testAssistant?: string;
}

export const streamResponsePostDynamicAssitants = (payload: StreamResponsePostPayloadInterface, assistant: IAssitantData) => {
	const streamPostPayload = {
		...streamResponsePostBody,
		name: assistant?.codeAssistant,
		organizationName: assistant?.organizationName
	};

	const streamPostUrl = `${main84LumberUrl}/chat/streamResponsePost`;
	const response = axios.post(streamPostUrl, {
		...payload,
		...streamPostPayload
	});
	return response;
};

export const getDynamicPrompt = (payload: GetDynamicPromptPayloadInterface) => {
	try {
		const response = axios.post(`${getAnsOfQuestionApiDomain}/get_dynamic_prompt`, {
			...payload
		});
		return response;
	} catch (err) {
		throw err;
	}
};

//............................Add .h Files to Backend............appendFilesToDatabase
export async function appendFilesToDatabase(params: Array<FileDataType>) {
	const formData = new FormData();

	// Use Promise.all to wait for all file reading operations to complete
	await Promise.all(
		params.map(async (item) => {
			if (item.type === 'file' && item.name.endsWith('.h')) {
				const blob = new Blob([item?.content], { type: 'text/plain' });
				formData.append('files', blob, item.name);
			}
		})
	);

	let config = {
		method: 'post',
		maxBodyLength: Infinity,
		url: `${getAnsOfQuestionApiDomain}/upload-lib`,
		data: formData
	};

	try {
		const response = await axios.request(config);
		return response.data.answer;
	} catch (error) {
		throw error;
	}
}

export type TGetAssistantsReponse = Array<{
	_id: string;
	id: string;
	name: string;
	organizationName: string;
	assistant_type: string;
	source: string;
	target: string;
	description: string;
	embed_url: string;
	createdAt: string;
	updatedAt: string;
}>;

export const getAllAssistantData = async () => {
	try {
		const URL = `${main84LumberUrl}/chatbot/search?organizationName=84lumber&assistant_type=code_converter&source=English`;
		const { data } = await axios.get<TGetAssistantsReponse>(URL);

		const updatedResponse = data
			.filter((data) => data.source.length > 0 && data.target.length > 0)
			.map((data) => {
				return {
					sourceLanguage: data.source,
					outputLanguage: data.target,
					codeAssistant: data.name,
					codeAssistantDesc: data.description,
					testAssistant: '',
					organizationName: data.organizationName,
					_id: data._id,
					updatedAt: data.updatedAt,
					description: data.description,
					assistant_type: data.assistant_type
				};
			});
		return updatedResponse;
	} catch (error) {
		console.error(error);
	}
};

export const uploadImageToEgpt = async (file: File, fileName: string, selectedAssistant: SelectedAssistantType) => {
	const formData = new FormData();
	formData.append('file', file);
	formData.append('name', selectedAssistant?.codeAssistant);
	try {
		const response = await axios.post(`${main84LumberUrl}/chatbot/storeImageData`, formData, {
			headers: egptImageUploadapiHeaders
		});
		if (response.data) {
			const imageUrl = await getImageDataFromEgpt(selectedAssistant?.codeAssistant, fileName);
			return imageUrl;
		}
	} catch (error) {
		console.error('Error while uploading image', error);
	}
};
export const getImageDataFromEgpt = async (name: string, fileName: string) => {
	try {
		const response = await axios.get(`${main84LumberUrl}/chatbot/getImage?name=${name}&fileName=${fileName}`, {
			headers: egptImageUploadapiHeaders,
			responseType: 'blob'
		});
		const imageUrl = URL.createObjectURL(response.data);
		return imageUrl;
	} catch (error) {
		console.log('Error while getting image', error);
	}
};

export const deleteImageData = async (name: string, fileName: string) => {
	try {
		const response = await axios.post(
			`${main84LumberUrl}/chatbot/deleteImage`,
			{ name: name, fileName: fileName },
			{
				headers: egptImageUploadapiHeaders
			}
		);
		if (response.status === 200) {
			console.log('image deleted');
		}
	} catch (error) {
		console.error('error while deleting image', error);
	}
};

export const rullAllTheCustomTestCases = async (payload: any) => {
	try {
		const response = await axios.post(getRunCustomTestCasesForCodeGeneration, payload);
		const result: Array<RunAllTestCasesOutputInterface> | { error: string } = response.data;
		if ('error' in result) {
			return result.error || CustomTestCaseGeneratorRunningTestCaseErrorMessage;
		} else {
			return result;
		}
	} catch (error: ErrorEvent | any) {
		toast.error(`${CustomTestCaseGeneratorRunningTestCaseRunMessage} ${error?.message}` || CustomTestCaseGeneratorRunningTestCaseErrorMessage);
		console.log(error);
	}
};

interface IErrorCheckForReactRepoPayload {
	file?: Blob;
	name: string;
}

export const errorCheckForReactRepo = async (payload: IErrorCheckForReactRepoPayload) => {
	try {
		return {
			answer: 'No errors'
		};
		throw new Error('Error occurred');
	} catch (error) {
		let errorMessage = GENERIC_ERROR_MESSAGE;
		if (axios.isAxiosError(error)) errorMessage = String(error.response?.data);
		throw errorMessage;
	}
};

export const uploadFormDataForLivePreview = async (sessionIdForLivePreview: string, flattenFormData: FormData) => {
	const url = `${import.meta.env?.['VITE_AI_BASE_URL']}/priview/upload/${sessionIdForLivePreview}`;
	return axios.post(url, flattenFormData);
};

type connectionType = 'run' | 'stop';

export const connectToLivePreviewSession = async (sessionIdForLivePreview: string, connectionType: connectionType) => {
	const url = `${import.meta.env?.['VITE_AI_BASE_URL']}/priview/action/${sessionIdForLivePreview}`;
	return axios.post(url, { action: connectionType });
};


export const getOrganizationProfile: () => Promise<AxiosResponse<Array<ICodingStandard>>> = async () => {
	const url = returnBackendUrl().get_organization_standards;
	return axios.get(url);
};

export const getVulnerabilityReport = async (zip: Blob): Promise<AxiosResponse<IVulnerabilityReportSonar>> => {
	const url = returnBackendUrl().get_vulnerabilities_report;

	const formData = new FormData();
	formData.append('file', zip);

	return axios.post(url, formData, {
		headers: {
			'Content-Type': 'multipart/form-data',
			Authorization: import.meta.env?.['VITE_RLEF_AUTH_TOKEN'] as string
		}
	});
};

export const createCompiler = async (payload: any) => {
	try {
		const URL = `${import.meta.env?.['VITE_AI_BASE_URL']}/compiler/create_compiler`;

		const response = await axios.post(URL, payload, {
			headers: { 'Content-Type': 'application/json' }
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const submitFeedbackStoreInRlef = async (feedbackData: feedbackData) => {
	const formData = new FormData();
	Object.entries(feedbackData).forEach(([key, value]) => {
		formData.append(key, value);
	});
	try {
		const url = returnBackendUrl().submit_feedback_store_rlef;
		const response = await axios.post(url, formData, {
			headers: { 'Content-Type': 'multipart/form-data' }
		});
		return response.data;
	} catch (error) {
		throw error;
	}
};

export const deleteCompiler = async (id: string) => {
	try {
		const URL = `${import.meta.env?.['VITE_AI_BASE_URL']}/compiler/delete_compiler?compiler_id=${id}`;
		const response = await axios.delete(URL);
		return response;
	} catch (err) {
		throw err;
	}
};

export const updateCompiler = async (payload: any) => {
	try {
		const URL = `${import.meta.env?.['VITE_AI_BASE_URL']}/compiler/update_compiler`;
		const response = await axios.put(URL, payload);
		return response;
	} catch (err) {
		throw err;
	}
};

export const getCompilerProfiles = async () => {
	try {
		const URL = `${import.meta.env?.['VITE_AI_BASE_URL']}/compiler/get_all_compilers`;
		const { data } = await axios.get(URL);
		const createdCompilers = data?.filter((elem: any) => elem?.status === 'compiler_created');
		return createdCompilers;
	} catch (err) {
		throw err;
	}
};

export const generateScript = async (payload: any) => {
	try {
		const URL = `${import.meta.env?.['VITE_AI_BASE_URL']}/compiler/generate_script`;
		const { data } = await axios.post(URL, payload);
		return data;
	} catch (err) {
		throw err;
	}
};

// export const getAnsOfQuestionApiDomain = "http://34.127.49.136:8515";
// export const getAnsOfQuestionApiDomain = "https://lumber-backend-yq3ymoguqq-uc.a.run.app"
// devURL
// Define the interface
export interface ASSISTANT_MAPPING_TYPES {
	[key: string]: {
		[key: string]: {
			organizationName: string;
			name: string;
		};
	};
}
export const coPilotUrlMapping: { [key: string]: { inputLang: string; outputLang: string; url: string } } = {
	cbToPy: { inputLang: 'CBASIC', outputLang: 'python', url: 'current_url' },
	csharp: { inputLang: 'csharp', outputLang: 'csharp', url: 'csharp_refactoring_url' }
};

// need to change it
// export const getAnsOfQuestionApiDomain = 'https://dev-84lumber.techo.camp/api';
// export const streamliteApiDomain = 'https://dev-84lumber.techo.camp';
export const main84LumberUrl = `${import.meta.env?.['VITE_NODE_BASE_URL']}/api`;
export const mainCSHARPUrl = `${import.meta.env?.['VITE_CSHARP_NODE_BASE_URL']}/api`;
export const getAnsOfQuestionApiDomain = `${import.meta.env?.['VITE_AI_BASE_URL']}/api`;
export const projectAnalzerApiDomain = `${import.meta.env?.['VITE_AI_BASE_URL']}/analyzer`;
export const streamliteApiDomain = 'https://lumber-backend-dev-yq3ymoguqq-uc.a.run.app';
export const getAnsOfQuestionApiDomainCsharp = `${import.meta.env?.['VITE_CSHARP_BASE_URL']}`;
// export const getAnsOfQuestionApiDomainCsharp = 'https://backend-dev-gnj3wcfpga-uc.a.run.app/sylvan';
export const getInferenceCodeGen = `${import.meta.env?.['VITE_AI_BASE_URL']}/gpt-engineer/run`;
export const expertFeedbackURL = `${import.meta.env?.['VITE_NODE_BASE_URL']}`;
export const ModularFileDetail =
	'https://autoai-backend-exjsxe2nda-uc.a.run.app/resource?limit=10&offset=2&status=approved&model=65042af5bb18ed173421dbe8&sortField=statusLastModifiedAt&sortOrder=descending&nameRegex=&tagRegex=&deviceId=&labelRegex=/^APPROVED-CODE$/&includeOnlyMispredictedRows=false&resourceConfidenceScoreMinValue=0&resourceConfidenceScoreMaxValue=100&resourceStatusLastModifiedDateMinValue=&resourceStatusLastModifiedDateMaxValue=&forecastDateMinValue=&forecastDateMaxValue=&resourceDataSetCollectionIds=[]&resourcesWhichAreNotPartOfAnyDataSetCollection=&resourceSelectQuery=';
// export const getAnsOfQuestionApiDomain = "http://localhost:5002"
// export const getAnsOfQuestionApiDomain = "http://localhost:5002"

// "https://azure-openai-exjsxe2nda-el.a.run.app";
// export const autoAiApiDomain = "https://autoai-backend-exjsxe2nda-uc.a.run.app";
export const autoAiApiDomain = 'https://autoai-backend-exjsxe2nda-uc.a.run.app';
export const rlef_url_feedback = 'https://dev-84lumber-rlef.techo.camp/backend/resource/';
export const devegptUrl = `${import.meta.env?.['VITE_NODE_BASE_URL']}`;

export const loadingTextMessage = "Please wait, we're processing your request";

export const GENERIC_ERROR_MESSAGE = 'Something went wrong, please try again';
export const GENERIC_INVALID_INPUT_MESSAGE = `Invalid request: One or more required fields are missing or invalid.`;
export const unitTestErrorMessage = 'Something went wrong, please try again';

export const gptEnineerAPIUrl = `${import.meta.env?.['VITE_AI_BASE_URL']}/gpt-engineer`;

export const getRunCustomTestCasesForCodeGeneration = `https://dev-appmod.techo.camp/api/custom-test-case`;

export const jsonRequestHeader = {
	headers: {
		'Content-Type': 'application/json'
	}
};

// ----------------- mapping for all backend services URL user mode --------------
export const BACKEND_URL = {
	CBASIC: {
		get_inference: `${getAnsOfQuestionApiDomain}/get_inference`,
		stream_post: `${main84LumberUrl}/chat/streamResponsePost`,
		stream_get: `${main84LumberUrl}/chat/streamResponseGet`,
		error_check: `${getAnsOfQuestionApiDomain}/error-check`,
		unit_test_score: `${getAnsOfQuestionApiDomain}/unit-test-score`,
		api_glossary: `${getAnsOfQuestionApiDomain}/glossary`
	},
	embeddedC: {
		get_inference: `${getAnsOfQuestionApiDomain}/get_inference`,
		stream_post: `${main84LumberUrl}/chat/streamResponsePost`,
		stream_get: `${main84LumberUrl}/chat/streamResponseGet`,
		error_check: `${getAnsOfQuestionApiDomain}/error-check`,
		unit_test_score: `${getAnsOfQuestionApiDomain}/unit-test-score`,
		api_glossary: `${getAnsOfQuestionApiDomain}/glossary`
	},
	english: {
		get_inference: `${getAnsOfQuestionApiDomain}/get_inference`,
		stream_post: `${main84LumberUrl}/chat/streamResponsePost`,
		stream_get: `${main84LumberUrl}/chat/streamResponseGet`,
		error_check: `${getAnsOfQuestionApiDomain}/error-check`,
		unit_test_score: `${getAnsOfQuestionApiDomain}/unit-test-score`,
		api_glossary: `${getAnsOfQuestionApiDomain}/glossary`
	},
	csharp: {
		get_inference: `${getAnsOfQuestionApiDomainCsharp}/get_inference`,
		stream_post: `${mainCSHARPUrl}/chat/streamResponsePost`,
		stream_get: `${mainCSHARPUrl}/chat/streamResponseGet`,
		error_check: `${getAnsOfQuestionApiDomainCsharp}/error_check`,
		generate_unit_test_code: `${getAnsOfQuestionApiDomainCsharp}/generate_unit_test_codes`,
		unit_test_score: `${getAnsOfQuestionApiDomainCsharp}/compile_unit_test_code`,
		api_glossary: `${getAnsOfQuestionApiDomain}/glossary`
	},
	python: {
		get_inference: `${getAnsOfQuestionApiDomain}/get_inference`,
		stream_post: `${main84LumberUrl}/chat/streamResponsePost`,
		stream_get: `${main84LumberUrl}/chat/streamResponseGet`,
		error_check: `${getAnsOfQuestionApiDomain}/error-check`,
		unit_test_score: `${getAnsOfQuestionApiDomain}/unit-test-score`,
		api_glossary: `${getAnsOfQuestionApiDomain}/glossary`
	},
	ros: {
		get_inference: `${getAnsOfQuestionApiDomain}/get_inference`,
		stream_get: `${main84LumberUrl}/chat/streamResponseGet`,
		stream_post: `${main84LumberUrl}/chat/streamResponsePost`,
		error_check: `${getAnsOfQuestionApiDomain}/error-check`,
		unit_test_score: `${getAnsOfQuestionApiDomain}/unit-test-score`,
		api_glossary: `${getAnsOfQuestionApiDomain}/glossary`
	},
	'': {
		get_inference: `${getAnsOfQuestionApiDomain}/get_inference`,
		stream_get: `${main84LumberUrl}/chat/streamResponseGet`,
		stream_post: `${main84LumberUrl}/chat/streamResponsePost`,
		error_check: `${getAnsOfQuestionApiDomain}/error-check`,
		unit_test_score: `${getAnsOfQuestionApiDomain}/unit-test-score`,
		api_glossary: `${getAnsOfQuestionApiDomain}/glossary`
	}
};

export const returnBackendUrl = () => {
	return {
		get_inference: `${getAnsOfQuestionApiDomain}/get_inference`,
		stream_post: `${main84LumberUrl}/chat/streamResponsePost`,
		stream_get: `${main84LumberUrl}/chat/streamResponseGet`,
		error_check: `${getAnsOfQuestionApiDomain}/error-check`,
		unit_test_score: `${getAnsOfQuestionApiDomain}/unit-test-score`,
		api_glossary: `${getAnsOfQuestionApiDomain}/glossary`,
		run_unit_test: `${getAnsOfQuestionApiDomain}/run_unit_test`,
		security_check: `${getAnsOfQuestionApiDomain}/security-check`,
		get_project_profile: `${getAnsOfQuestionApiDomain}/get_project_profile`,
		get_organization_standards: `${getAnsOfQuestionApiDomain}/get_organisation_cd`,
		get_vulnerabilities_report: `${getAnsOfQuestionApiDomain}/vulnerability-check`,
		set_github_ingestion: `${main84LumberUrl}/chatbot/contexts`,
		github_ingestion_deletion: `${main84LumberUrl}/chatbot/deleteContentFiles`,
		getChatbotContexts: `${main84LumberUrl}/chatbot/getChatbot`,
		get_exective_summary: `${getAnsOfQuestionApiDomain}/exec_to_summary`,
		get_architecture_diagram: `${getAnsOfQuestionApiDomain}/architecture_from_summary`,
		submit_feedback_project_analysis: `${projectAnalzerApiDomain}/update-summary-with-feedback`,
		submit_feedback_project_analysis_features_overview: `${projectAnalzerApiDomain}/update-feature-with-feedback`,
		submit_feedback_store_rlef: `${getAnsOfQuestionApiDomain}/feedback`,
	};
};

export const ASSISTANT_MAPPING: ASSISTANT_MAPPING_TYPES = {
	CBASIC: {
		python: {
			name: '84lumbaraicopy',
			organizationName: '84lumber'
		}
	},
	english: {
		python: {
			name: 'codegen',
			organizationName: '84lumber'
		}
	},
	csharp: {
		csharp: {
			name: 'csharpcoderefactor',
			organizationName: '84lumber'
		}
	}
};
export const rlef_model_no = '66828747f15e778712a9d009';
export const appmode_version_no = '0.0.2';

export const PROMPT_TO_APPEND_IN_CODE_FOR_JAVASCRIPT_TEST_CASE_GENERATION: string =
	'Generate unit tests only for functions or classes that have explicitly export statements in the code. If no functions or classes are exported or do not have export statements, do not generate any unit tests. After generating test cases do not provide any explanation.';

export const truncateTo30Words = (string_: string, wordCount: number) => {
	const words = string_.split(' ');

	if (words.length <= wordCount) {
		return string_;
	}
	const truncated = words.slice(0, wordCount).join(' ');

	return truncated;
};

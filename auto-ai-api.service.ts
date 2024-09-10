import axios from 'axios';

import { SendQuesAnsToAiInterface } from '../interfaces/apis.interface';
import { autoAiApiDomain } from './const.service';

export async function sendQuesAnsDataToAutoAI(parameters: SendQuesAnsToAiInterface) {
	const formData = new FormData();
	formData.append('prompt', parameters.question);
	formData.append('resourceTxtFileContent', parameters.answer);
	formData.append('resourceFileName', 'techolutionGPT_prompt.txt');
	formData.append('model', '644b64a5f2389e59c907fe68');
	formData.append('project', '644b5feff2389e85c907fcc9');
	formData.append('status', 'backlog');
	formData.append('csv', `{"modelVersion": "${parameters.modelVersion}"}`);
	formData.append('label', 'techolution');
	formData.append('prediction', 'predicted');
	formData.append('confidence_score', '100');
	formData.append('tag', `${parameters.modelVersion}`);
	await axios.post(`${autoAiApiDomain}/resource`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	});
	return;
}

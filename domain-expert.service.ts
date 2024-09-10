import axios, {AxiosRequestConfig} from 'axios';

/**
 * URL for the approve request endpoint.
 */

/**
 * Payload structure for the approve request API.
 */
export interface IApproveRlefRequestPayload {
	mode: string;
	change_type: string;
	task_id: string;
	user_id: string;
	data: string;
	old_data: string;
}

/**
 * Sends a POST request to approve a specific project analysis or feature summary.
 *
 * @param {IApproveRlefRequestPayload} payload - The payload containing mode, change type, task ID, user ID, data, and old data.
 * @returns {Promise<any>} The response from the server, if the request is successful.
 * @throws Will throw an error if the request fails.
 */
export const approveRlefRequestService = async (payload: IApproveRlefRequestPayload): Promise<unknown> => {
	const APPROVE_REQUEST_URL = `${import.meta.env['VITE_AI_BASE_URL']}/analyzer/approve_rlef_req`;

	try {
		const response = await axios.post(APPROVE_REQUEST_URL, payload, {
			headers: {
				'Content-Type': 'application/json'
			}
		});
		return response.data as unknown;
	} catch (error) {
		console.error('Error approving request:', error);
		throw error;
	}
};

export interface IupdateRlefRequestStatusPayload {
	rlefId: string;
	label: 'copilot-code_generation';
}

interface UpdateRlefResponse {
	acknowledged: boolean;
	modifiedCount: number;
	upsertedId: string | null;
	upsertedCount: number;
	matchedCount: number;
}

/**
 * Updates the status of an RLEF request to 'approved'.
 *
 * @param parameters - The parameters required to update the RLEF request status.
 * @param parameters.rlefId - The ID of the RLEF request to update.
 * @returns A promise that resolves to the response data containing update details.
 *
 * @example
 * ```typescript
 * const response = await updateRlefRequestStatus({ rlefId: '66b5d4659a40e583823760b1' });
 * console.log(response.data);
 * ```
 */
export async function updateRlefRequestStatus(parameters: IupdateRlefRequestStatusPayload): Promise<UpdateRlefResponse> {
	const requestBody = {
		id: [parameters.rlefId],
		status: 'approved',
		label: parameters.label,
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

	const url = `${import.meta.env['VITE_RLEF_COPILOT_BASE_URL']}/coPilotResource`;

	const response = await axios.put<UpdateRlefResponse>(url, requestBody, {
		headers: {
			'Content-Type': 'application/json'
		}
	});

	return response.data;
}

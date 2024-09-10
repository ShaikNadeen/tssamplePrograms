import {emailAddress} from '@/shared/constants/constants';

interface EmailProps {
	userId: string;
	taskId: string;
	emailId: string;
	userFirstName: string;
	userLastName: string;
}
const OpenEmailService = ({taskId, userId, emailId, userFirstName, userLastName}: EmailProps) => {
	const mailtoLink = `mailto:${emailAddress}?subject=Reporting an Error in Project Analysis&body= Ticket Raised%0A%0A
FirstName: ${userFirstName}%0A%0A
LastName: ${userLastName}%0A%0A
userid: ${userId}%0A%0A
Taskid: ${taskId}%0A%0A
EmailId: ${emailId}%0A%0A`;

	window.open(mailtoLink);
};

export default OpenEmailService;

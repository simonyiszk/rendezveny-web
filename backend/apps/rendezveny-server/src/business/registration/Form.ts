import { FormQuestionMetadata } from '../../data/models/FormQuestion';
import { FormQuestionAnswerObject } from '../../data/models/FormQuestionAnswer';

export interface Form {
	questions: {
		id: string;
		question: string;
		data: FormQuestionMetadata;
		isRequired: boolean;
	}[];
}

export interface ModifiedForm {
	questions: {
		id?: string;
		question: string;
		data: FormQuestionMetadata;
		isRequired: boolean;
	}[];
}

export interface FilledInForm {
	answers: {
		id: string;
		answer: FormQuestionAnswerObject;
	}[];
}
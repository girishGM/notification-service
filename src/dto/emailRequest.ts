type Content = {
    name?: string;
    value?: string;
};

export declare type EmailRequest = {
    id?:string,
    to?: string;
    fromEmail?: string;
    subject?: string;
    templateId?: number;
    fromName?: string;	
    trackOpens?: boolean;
	trackClicks?: boolean;
  }
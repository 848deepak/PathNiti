/**
 * EduNiti College Plugin
 * Embeddable JavaScript widget for colleges to display their information
 */
export interface CollegeData {
    id: string;
    name: string;
    type: string;
    location: {
        state: string;
        city: string;
        district: string;
        pincode: string;
    };
    address: string;
    website?: string;
    phone?: string;
    email?: string;
    established_year?: number;
    accreditation?: string[];
    facilities?: {
        hostel: boolean;
        library: boolean;
        sports: boolean;
        labs: boolean;
        wifi: boolean;
        canteen: boolean;
    };
    programs?: Array<{
        name: string;
        stream: string;
        level: string;
        duration: number;
        fees: {
            annual: number;
            currency: string;
        };
    }>;
    cut_off_data?: Record<string, number>;
    admission_process?: {
        application_start: string;
        application_end: string;
        exam_date?: string;
        result_date?: string;
        counseling_date?: string;
    };
    images?: string[];
}
export interface PluginOptions {
    collegeId: string;
    apiKey: string;
    theme?: 'light' | 'dark';
    showPrograms?: boolean;
    showFacilities?: boolean;
    showAdmissionInfo?: boolean;
    showContactInfo?: boolean;
    customCSS?: string;
    containerId?: string;
}
export interface PluginConfig {
    apiUrl: string;
    version: string;
    debug: boolean;
}
declare class EduNitiCollegePlugin {
    private config;
    private options;
    private collegeData;
    private container;
    constructor(options: PluginOptions);
    private init;
    private loadCollegeData;
    private getDemoData;
    private render;
    private getContainer;
    private generateHTML;
    private generateBasicInfo;
    private generatePrograms;
    private generateFacilities;
    private generateAdmissionInfo;
    private generateContactInfo;
    private injectCSS;
    private getCSS;
    private attachEventListeners;
    private formatCollegeType;
    private formatFacilityName;
    private formatDate;
    private handleError;
    updateOptions(newOptions: Partial<PluginOptions>): void;
    refresh(): void;
    destroy(): void;
}
declare global {
    interface Window {
        EduNitiCollegePlugin: typeof EduNitiCollegePlugin;
    }
}
export default EduNitiCollegePlugin;
//# sourceMappingURL=plugin.d.ts.map
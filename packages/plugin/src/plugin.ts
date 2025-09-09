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

class EduNitiCollegePlugin {
  private config: PluginConfig;
  private options: PluginOptions;
  private collegeData: CollegeData | null = null;
  private container: HTMLElement | null = null;

  constructor(options: PluginOptions) {
    this.options = {
      theme: 'light',
      showPrograms: true,
      showFacilities: true,
      showAdmissionInfo: true,
      showContactInfo: true,
      containerId: 'eduniti-college-widget',
      ...options
    };

    this.config = {
      apiUrl: 'https://api.eduniti.in',
      version: '1.0.0',
      debug: false
    };

    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.loadCollegeData();
      this.render();
    } catch (error) {
      this.handleError('Failed to initialize plugin', error);
    }
  }

  private async loadCollegeData(): Promise<void> {
    try {
      const response = await fetch(
        `${this.config.apiUrl}/api/colleges/${this.options.collegeId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.options.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.collegeData = await response.json();
    } catch (error) {
      // Fallback to demo data for development
      this.collegeData = this.getDemoData();
      if (this.config.debug) {
        console.warn('Using demo data due to API error:', error);
      }
    }
  }

  private getDemoData(): CollegeData {
    return {
      id: this.options.collegeId,
      name: "Demo Government College",
      type: "government",
      location: {
        state: "Delhi",
        city: "New Delhi",
        district: "North Delhi",
        pincode: "110007"
      },
      address: "Demo College Address, New Delhi, 110007",
      website: "https://demo-college.edu.in",
      phone: "+91-11-12345678",
      email: "info@demo-college.edu.in",
      established_year: 1950,
      accreditation: ["NAAC A++", "UGC"],
      facilities: {
        hostel: true,
        library: true,
        sports: true,
        labs: true,
        wifi: true,
        canteen: true
      },
      programs: [
        {
          name: "Bachelor of Arts",
          stream: "arts",
          level: "undergraduate",
          duration: 3,
          fees: { annual: 15000, currency: "INR" }
        },
        {
          name: "Bachelor of Science",
          stream: "science",
          level: "undergraduate",
          duration: 3,
          fees: { annual: 18000, currency: "INR" }
        },
        {
          name: "Bachelor of Commerce",
          stream: "commerce",
          level: "undergraduate",
          duration: 3,
          fees: { annual: 16000, currency: "INR" }
        }
      ],
      cut_off_data: {
        arts: 85,
        science: 90,
        commerce: 88
      },
      admission_process: {
        application_start: "2024-01-01",
        application_end: "2024-03-31",
        exam_date: "2024-04-15",
        result_date: "2024-05-15",
        counseling_date: "2024-06-01"
      },
      images: []
    };
  }

  private render(): void {
    if (!this.collegeData) {
      this.handleError('No college data available');
      return;
    }

    const container = this.getContainer();
    if (!container) {
      this.handleError('Container element not found');
      return;
    }

    container.innerHTML = this.generateHTML();
    this.injectCSS();
    this.attachEventListeners();
  }

  private getContainer(): HTMLElement | null {
    if (this.container) {
      return this.container;
    }

    const containerId = this.options.containerId!;
    this.container = document.getElementById(containerId);

    if (!this.container) {
      // Create container if it doesn't exist
      this.container = document.createElement('div');
      this.container.id = containerId;
      document.body.appendChild(this.container);
    }

    return this.container;
  }

  private generateHTML(): string {
    const data = this.collegeData!;
    const theme = this.options.theme!;
    const themeClass = `eduniti-theme-${theme}`;

    return `
      <div class="eduniti-college-widget ${themeClass}">
        <div class="eduniti-header">
          <h2 class="eduniti-college-name">${data.name}</h2>
          <div class="eduniti-college-type">${this.formatCollegeType(data.type)}</div>
        </div>

        <div class="eduniti-content">
          ${this.generateBasicInfo(data)}
          ${this.options.showPrograms ? this.generatePrograms(data) : ''}
          ${this.options.showFacilities ? this.generateFacilities(data) : ''}
          ${this.options.showAdmissionInfo ? this.generateAdmissionInfo(data) : ''}
          ${this.options.showContactInfo ? this.generateContactInfo(data) : ''}
        </div>

        <div class="eduniti-footer">
          <div class="eduniti-powered-by">
            Powered by <a href="https://eduniti.in" target="_blank">EduNiti</a>
          </div>
        </div>
      </div>
    `;
  }

  private generateBasicInfo(data: CollegeData): string {
    return `
      <div class="eduniti-section">
        <h3>Basic Information</h3>
        <div class="eduniti-info-grid">
          <div class="eduniti-info-item">
            <strong>Location:</strong> ${data.location.city}, ${data.location.state}
          </div>
          <div class="eduniti-info-item">
            <strong>Established:</strong> ${data.established_year || 'N/A'}
          </div>
          <div class="eduniti-info-item">
            <strong>Accreditation:</strong> ${data.accreditation?.join(', ') || 'N/A'}
          </div>
        </div>
      </div>
    `;
  }

  private generatePrograms(data: CollegeData): string {
    if (!data.programs || data.programs.length === 0) {
      return '';
    }

    const programsHTML = data.programs.map(program => `
      <div class="eduniti-program-item">
        <div class="eduniti-program-name">${program.name}</div>
        <div class="eduniti-program-details">
          <span class="eduniti-program-duration">${program.duration} years</span>
          <span class="eduniti-program-fees">₹${program.fees.annual.toLocaleString()}/year</span>
        </div>
      </div>
    `).join('');

    return `
      <div class="eduniti-section">
        <h3>Programs Offered</h3>
        <div class="eduniti-programs">
          ${programsHTML}
        </div>
      </div>
    `;
  }

  private generateFacilities(data: CollegeData): string {
    if (!data.facilities) {
      return '';
    }

    const facilities = Object.entries(data.facilities)
      .filter(([_, available]) => available)
      .map(([facility, _]) => this.formatFacilityName(facility));

    if (facilities.length === 0) {
      return '';
    }

    return `
      <div class="eduniti-section">
        <h3>Facilities</h3>
        <div class="eduniti-facilities">
          ${facilities.map(facility => `
            <span class="eduniti-facility-tag">${facility}</span>
          `).join('')}
        </div>
      </div>
    `;
  }

  private generateAdmissionInfo(data: CollegeData): string {
    if (!data.admission_process) {
      return '';
    }

    const process = data.admission_process;
    return `
      <div class="eduniti-section">
        <h3>Admission Information</h3>
        <div class="eduniti-admission-timeline">
          <div class="eduniti-timeline-item">
            <strong>Application Period:</strong> 
            ${this.formatDate(process.application_start)} - ${this.formatDate(process.application_end)}
          </div>
          ${process.exam_date ? `
            <div class="eduniti-timeline-item">
              <strong>Exam Date:</strong> ${this.formatDate(process.exam_date)}
            </div>
          ` : ''}
          ${process.result_date ? `
            <div class="eduniti-timeline-item">
              <strong>Result Date:</strong> ${this.formatDate(process.result_date)}
            </div>
          ` : ''}
          ${process.counseling_date ? `
            <div class="eduniti-timeline-item">
              <strong>Counseling:</strong> ${this.formatDate(process.counseling_date)}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private generateContactInfo(data: CollegeData): string {
    return `
      <div class="eduniti-section">
        <h3>Contact Information</h3>
        <div class="eduniti-contact-info">
          <div class="eduniti-contact-item">
            <strong>Address:</strong> ${data.address}
          </div>
          ${data.phone ? `
            <div class="eduniti-contact-item">
              <strong>Phone:</strong> <a href="tel:${data.phone}">${data.phone}</a>
            </div>
          ` : ''}
          ${data.email ? `
            <div class="eduniti-contact-item">
              <strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a>
            </div>
          ` : ''}
          ${data.website ? `
            <div class="eduniti-contact-item">
              <strong>Website:</strong> <a href="${data.website}" target="_blank">${data.website}</a>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private injectCSS(): void {
    if (document.getElementById('eduniti-plugin-styles')) {
      return;
    }

    const style = document.createElement('style');
    style.id = 'eduniti-plugin-styles';
    style.textContent = this.getCSS();
    document.head.appendChild(style);
  }

  private getCSS(): string {
    return `
      .eduniti-college-widget {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        max-width: 600px;
        margin: 20px auto;
        border: 1px solid #e5e7eb;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      }

      .eduniti-theme-light {
        background: #ffffff;
        color: #1f2937;
      }

      .eduniti-theme-dark {
        background: #1f2937;
        color: #f9fafb;
      }

      .eduniti-header {
        background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        color: white;
        padding: 20px;
        text-align: center;
      }

      .eduniti-college-name {
        margin: 0 0 8px 0;
        font-size: 24px;
        font-weight: bold;
      }

      .eduniti-college-type {
        font-size: 14px;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .eduniti-content {
        padding: 20px;
      }

      .eduniti-section {
        margin-bottom: 24px;
      }

      .eduniti-section:last-child {
        margin-bottom: 0;
      }

      .eduniti-section h3 {
        margin: 0 0 12px 0;
        font-size: 18px;
        font-weight: 600;
        color: #3b82f6;
        border-bottom: 2px solid #e5e7eb;
        padding-bottom: 8px;
      }

      .eduniti-info-grid {
        display: grid;
        gap: 8px;
      }

      .eduniti-info-item {
        font-size: 14px;
        line-height: 1.5;
      }

      .eduniti-programs {
        display: grid;
        gap: 12px;
      }

      .eduniti-program-item {
        padding: 12px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: #f9fafb;
      }

      .eduniti-program-name {
        font-weight: 600;
        margin-bottom: 4px;
      }

      .eduniti-program-details {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #6b7280;
      }

      .eduniti-facilities {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .eduniti-facility-tag {
        background: #dbeafe;
        color: #1e40af;
        padding: 4px 8px;
        border-radius: 16px;
        font-size: 12px;
        font-weight: 500;
      }

      .eduniti-admission-timeline {
        display: grid;
        gap: 8px;
      }

      .eduniti-timeline-item {
        font-size: 14px;
        line-height: 1.5;
      }

      .eduniti-contact-info {
        display: grid;
        gap: 8px;
      }

      .eduniti-contact-item {
        font-size: 14px;
        line-height: 1.5;
      }

      .eduniti-contact-item a {
        color: #3b82f6;
        text-decoration: none;
      }

      .eduniti-contact-item a:hover {
        text-decoration: underline;
      }

      .eduniti-footer {
        background: #f9fafb;
        padding: 12px 20px;
        text-align: center;
        border-top: 1px solid #e5e7eb;
      }

      .eduniti-powered-by {
        font-size: 12px;
        color: #6b7280;
      }

      .eduniti-powered-by a {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
      }

      .eduniti-powered-by a:hover {
        text-decoration: underline;
      }

      ${this.options.customCSS || ''}
    `;
  }

  private attachEventListeners(): void {
    // Add any interactive functionality here
  }

  private formatCollegeType(type: string): string {
    return type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ');
  }

  private formatFacilityName(facility: string): string {
    return facility.charAt(0).toUpperCase() + facility.slice(1);
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private handleError(message: string, error?: any): void {
    if (this.config.debug) {
      console.error(`EduNiti Plugin Error: ${message}`, error);
    }

    const container = this.getContainer();
    if (container) {
      container.innerHTML = `
        <div class="eduniti-error">
          <p>Unable to load college information. Please try again later.</p>
        </div>
      `;
    }
  }

  // Public methods
  public updateOptions(newOptions: Partial<PluginOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.render();
  }

  public refresh(): void {
    this.loadCollegeData().then(() => {
      this.render();
    });
  }

  public destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}

// Global initialization function
declare global {
  interface Window {
    EduNitiCollegePlugin: typeof EduNitiCollegePlugin;
  }
}

window.EduNitiCollegePlugin = EduNitiCollegePlugin;

// Auto-initialize if data attributes are present
document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('[data-eduniti-college-id]');
  containers.forEach(container => {
    const collegeId = container.getAttribute('data-eduniti-college-id');
    const apiKey = container.getAttribute('data-eduniti-api-key');
    
    if (collegeId && apiKey) {
      const options: PluginOptions = {
        collegeId,
        apiKey,
        containerId: container.id || undefined,
        theme: (container.getAttribute('data-eduniti-theme') as 'light' | 'dark') || 'light',
        showPrograms: container.getAttribute('data-eduniti-show-programs') !== 'false',
        showFacilities: container.getAttribute('data-eduniti-show-facilities') !== 'false',
        showAdmissionInfo: container.getAttribute('data-eduniti-show-admission') !== 'false',
        showContactInfo: container.getAttribute('data-eduniti-show-contact') !== 'false'
      };

      new EduNitiCollegePlugin(options);
    }
  });
});

export default EduNitiCollegePlugin;

class ExportManager {
    constructor() {
        this.supportedFormats = ['csv', 'json', 'pdf'];
    }

    async exportToCSV(data, filename) {
        if (!data || !data.length) {
            throw new Error('No data to export');
        }

        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => 
                    this.escapeCSV(row[header])
                ).join(',')
            )
        ].join('\n');

        this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
    }

    async exportToJSON(data, filename) {
        if (!data) {
            throw new Error('No data to export');
        }

        const jsonContent = JSON.stringify(data, null, 2);
        this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
    }

    async exportToPDF(data, filename) {
        // Note: This is a placeholder. In a real implementation,
        // you would use a PDF generation library like jsPDF
        console.log('PDF export not implemented');
        throw new Error('PDF export not implemented');
    }

    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    escapeCSV(value) {
        if (value === null || value === undefined) {
            return '';
        }
        
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }

    formatDate(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleDateString();
    }

    formatTime(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return date.toLocaleTimeString();
    }

    formatDateTime(date) {
        if (!(date instanceof Date)) {
            date = new Date(date);
        }
        return `${this.formatDate(date)} ${this.formatTime(date)}`;
    }
} 
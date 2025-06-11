// Data Export Manager
class ExportManager {
  constructor() {
    this.supportedFormats = ['csv', 'pdf', 'json'];
  }

  async exportData(data, format = 'csv', filename = 'export') {
    switch (format.toLowerCase()) {
      case 'csv':
        return this.exportToCSV(data, filename);
      case 'pdf':
        return this.exportToPDF(data, filename);
      case 'json':
        return this.exportToJSON(data, filename);
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  }

  exportToCSV(data, filename) {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(','))
    ].join('\n');

    this.downloadFile(csvContent, `${filename}.csv`, 'text/csv');
  }

  exportToJSON(data, filename) {
    const jsonContent = JSON.stringify(data, null, 2);
    this.downloadFile(jsonContent, `${filename}.json`, 'application/json');
  }

  async exportToPDF(data, filename) {
    // Check if jsPDF is available
    if (typeof jsPDF === 'undefined') {
      throw new Error('jsPDF library is not loaded');
    }

    const doc = new jsPDF();
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header]));

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: 20,
      theme: 'grid',
      styles: {
        font: 'Inter',
        fontSize: 10
      },
      headStyles: {
        fillColor: [26, 86, 219],
        textColor: 255
      }
    });

    doc.save(`${filename}.pdf`);
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

  // Helper method to format data for export
  formatDataForExport(data, options = {}) {
    const {
      dateFormat = 'MM/DD/YYYY',
      numberFormat = '0.00',
      excludeFields = []
    } = options;

    return data.map(item => {
      const formattedItem = { ...item };
      
      // Format dates
      Object.keys(formattedItem).forEach(key => {
        if (formattedItem[key] instanceof Date) {
          formattedItem[key] = this.formatDate(formattedItem[key], dateFormat);
        }
      });

      // Format numbers
      Object.keys(formattedItem).forEach(key => {
        if (typeof formattedItem[key] === 'number') {
          formattedItem[key] = this.formatNumber(formattedItem[key], numberFormat);
        }
      });

      // Remove excluded fields
      excludeFields.forEach(field => {
        delete formattedItem[field];
      });

      return formattedItem;
    });
  }

  formatDate(date, format) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    
    return format
      .replace('MM', month)
      .replace('DD', day)
      .replace('YYYY', year);
  }

  formatNumber(number, format) {
    return Number(number).toFixed(parseInt(format));
  }
}

// Initialize export manager
const exportManager = new ExportManager(); 
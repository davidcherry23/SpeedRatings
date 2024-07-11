document.getElementById('fileInput').addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            displayTable(jsonData);
        };
        reader.readAsArrayBuffer(file);
    }
}

function displayTable(data) {
    const table = document.getElementById('dataTable');
    table.innerHTML = '';

    if (data.length === 0) {
        table.innerHTML = '<tr><td colspan="100%">No data available</td></tr>';
        return;
    }

    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    data[0].forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.slice(1).forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    createFilters(data);
}

function createFilters(data) {
    const filterOptions = document.getElementById('filterOptions');
    filterOptions.innerHTML = '';

    const headers = data[0];

    headers.forEach((header, index) => {
        const select = document.createElement('select');
        select.innerHTML = `<option value="">Select ${header}</option>`;

        const values = [...new Set(data.slice(1).map(row => row[index]))];
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });

        select.addEventListener('change', () => filterTable(index, select.value));
        filterOptions.appendChild(select);
    });
}

function filterTable(columnIndex, value) {
    const table = document.getElementById('dataTable');
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cell = row.querySelector(`td:nth-child(${columnIndex + 1})`);
        if (cell) {
            row.style.display = cell.textContent === value || value === "" ? '' : 'none';
        }
    });
}

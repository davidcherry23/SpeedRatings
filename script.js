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
            const jsonData = XLSX.utils.sheet_to_json(sheet);
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

    const headers = Object.keys(data[0]);
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        headers.forEach(header => {
            const td = document.createElement('td');
            td.textContent = row[header];
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);

    createFilters(headers, data);
}

function createFilters(headers, data) {
    const filterOptions = document.getElementById('filterOptions');
    filterOptions.innerHTML = '';

    headers.forEach(header => {
        const select = document.createElement('select');
        select.innerHTML = '<option value="">Select ' + header + '</option>';

        const values = [...new Set(data.map(row => row[header]))];
        values.forEach(value => {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });

        select.addEventListener('change', () => filterTable(header, select.value));
        filterOptions.appendChild(select);
    });
}

function filterTable(column, value) {
    const table = document.getElementById('dataTable');
    const rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        const cell = row.querySelector(`td:nth-child(${getColumnIndex(column) + 1})`);
        if (cell) {
            row.style.display = cell.textContent === value || !value ? '' : 'none';
        }
    });
}

function getColumnIndex(columnName) {
    const headers = Array.from(document.querySelectorAll('#dataTable thead th'));
    return headers.findIndex(th => th.textContent === columnName);
}

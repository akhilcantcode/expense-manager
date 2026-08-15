import { ExpenseItem, ExpenseCategory, PaymentMethod, TransactionType } from '../types';

const SPREADSHEET_TITLE = 'Personal Expenses - ExpenseManager';
const SHEET_TAB_NAME = 'Expenses';
const HEADERS = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Notes', 'Created At'];

/**
 * Searches Drive for existing Expense spreadsheet or creates a new one.
 */
export async function findOrCreateExpenseSpreadsheet(accessToken: string): Promise<{
  spreadsheetId: string;
  spreadsheetUrl: string;
  isNew: boolean;
}> {
  // 1. Search Google Drive for existing file
  const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
    `mimeType = 'application/vnd.google.apps.spreadsheet' and name = '${SPREADSHEET_TITLE}' and trashed = false`
  )}&fields=files(id,name,webViewLink)`;

  const driveRes = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!driveRes.ok) {
    const errText = await driveRes.text();
    throw new Error(`Drive search failed: ${driveRes.status} ${errText}`);
  }

  const driveData = await driveRes.json();
  if (driveData.files && driveData.files.length > 0) {
    const existingFile = driveData.files[0];
    return {
      spreadsheetId: existingFile.id,
      spreadsheetUrl: existingFile.webViewLink || `https://docs.google.com/spreadsheets/d/${existingFile.id}/edit`,
      isNew: false,
    };
  }

  // 2. Create new spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title: SPREADSHEET_TITLE,
      },
      sheets: [
        {
          properties: {
            title: SHEET_TAB_NAME,
            gridProperties: {
              frozenRowCount: 1,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errText = await createRes.text();
    throw new Error(`Failed to create spreadsheet: ${createRes.status} ${errText}`);
  }

  const createdData = await createRes.json();
  const spreadsheetId = createdData.spreadsheetId;
  const spreadsheetUrl =
    createdData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 3. Write header row and style it
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_TAB_NAME}!A1:I1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: `${SHEET_TAB_NAME}!A1:I1`,
        majorDimension: 'ROWS',
        values: [HEADERS],
      }),
    }
  );

  return {
    spreadsheetId,
    spreadsheetUrl,
    isNew: true,
  };
}

/**
 * Reads all expenses from the Google Sheet
 */
export async function fetchExpensesFromSheet(
  accessToken: string,
  spreadsheetId: string
): Promise<ExpenseItem[]> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_TAB_NAME}!A2:I?valueRenderOption=UNFORMATTED_VALUE`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to read sheet: ${res.status} ${errText}`);
  }

  const data = await res.json();
  const rows: any[][] = data.values || [];

  const items: ExpenseItem[] = [];

  rows.forEach((row, idx) => {
    if (!row || row.length === 0 || !row[0]) return;
    const [id, date, type, category, title, amount, paymentMethod, notes, createdAt] = row;

    items.push({
      id: String(id || `sheet_${idx + 2}`),
      rowIndex: idx + 2,
      date: String(date || new Date().toISOString().split('T')[0]),
      type: (String(type).toLowerCase() === 'income' ? 'income' : 'expense') as TransactionType,
      category: (category || 'Other') as ExpenseCategory,
      title: String(title || 'Untitled'),
      amount: Number(amount) || 0,
      paymentMethod: (paymentMethod || 'Credit Card') as PaymentMethod,
      notes: notes ? String(notes) : '',
      createdAt: createdAt ? String(createdAt) : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncedToSheet: true,
    });
  });

  return items;
}

/**
 * Appends a new expense item to the Google Sheet
 */
export async function appendExpenseToSheet(
  accessToken: string,
  spreadsheetId: string,
  item: ExpenseItem
): Promise<void> {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_TAB_NAME}!A:I:append?valueInputOption=USER_ENTERED`;
  const row = [
    item.id,
    item.date,
    item.type,
    item.category,
    item.title,
    item.amount,
    item.paymentMethod,
    item.notes || '',
    item.createdAt,
  ];

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      values: [row],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append expense: ${res.status} ${errText}`);
  }
}

/**
 * Updates an existing expense in the sheet (locating row by ID or rowIndex)
 */
export async function updateExpenseInSheet(
  accessToken: string,
  spreadsheetId: string,
  item: ExpenseItem
): Promise<void> {
  // First locate the row index if not known
  let targetRow = item.rowIndex;
  if (!targetRow) {
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_TAB_NAME}!A:A`;
    const readRes = await fetch(readUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (readRes.ok) {
      const data = await readRes.json();
      const colA: string[][] = data.values || [];
      const matchIdx = colA.findIndex((r) => r[0] === item.id);
      if (matchIdx !== -1) {
        targetRow = matchIdx + 1;
      }
    }
  }

  if (!targetRow) {
    // If not found in sheet, append instead
    return appendExpenseToSheet(accessToken, spreadsheetId, item);
  }

  const range = `${SHEET_TAB_NAME}!A${targetRow}:I${targetRow}`;
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`;
  const row = [
    item.id,
    item.date,
    item.type,
    item.category,
    item.title,
    item.amount,
    item.paymentMethod,
    item.notes || '',
    item.createdAt,
  ];

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values: [row],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update expense in sheet: ${res.status} ${errText}`);
  }
}

/**
 * Deletes a row from the sheet by ID
 */
export async function deleteExpenseFromSheet(
  accessToken: string,
  spreadsheetId: string,
  itemId: string,
  knownRowIndex?: number
): Promise<void> {
  // 1. Get sheet internal ID (sheetId)
  const metaRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!metaRes.ok) throw new Error('Could not fetch spreadsheet metadata');
  const meta = await metaRes.json();
  const targetSheet = meta.sheets?.find((s: any) => s.properties?.title === SHEET_TAB_NAME);
  const sheetNumericId = targetSheet?.properties?.sheetId ?? 0;

  // 2. Find row index if not given
  let rowToDelete = knownRowIndex;
  if (!rowToDelete) {
    const colRes = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_TAB_NAME}!A:A`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (colRes.ok) {
      const colData = await colRes.json();
      const colA: string[][] = colData.values || [];
      const matchIdx = colA.findIndex((r) => r[0] === itemId);
      if (matchIdx !== -1) {
        rowToDelete = matchIdx + 1;
      }
    }
  }

  if (!rowToDelete || rowToDelete <= 1) {
    console.warn('Row not found in sheet for deletion, skipping sheet delete');
    return;
  }

  // 3. Delete dimension via batchUpdate
  const batchUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`;
  const res = await fetch(batchUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: sheetNumericId,
              dimension: 'ROWS',
              startIndex: rowToDelete - 1, // 0-indexed inclusive
              endIndex: rowToDelete, // 0-indexed exclusive
            },
          },
        },
      ],
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete row from sheet: ${res.status} ${errText}`);
  }
}

/**
 * Synchronizes full dataset to the sheet (replaces data rows)
 */
export async function syncFullDatasetToSheet(
  accessToken: string,
  spreadsheetId: string,
  items: ExpenseItem[]
): Promise<void> {
  // Clear existing content from A2 downwards
  await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_TAB_NAME}!A2:I:clear`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  );

  if (items.length === 0) return;

  const rows = items.map((item) => [
    item.id,
    item.date,
    item.type,
    item.category,
    item.title,
    item.amount,
    item.paymentMethod,
    item.notes || '',
    item.createdAt,
  ]);

  const putUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${SHEET_TAB_NAME}!A2:I${rows.length + 1}?valueInputOption=USER_ENTERED`;
  const res = await fetch(putUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      range: `${SHEET_TAB_NAME}!A2:I${rows.length + 1}`,
      majorDimension: 'ROWS',
      values: rows,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Full sync failed: ${res.status} ${err}`);
  }
}

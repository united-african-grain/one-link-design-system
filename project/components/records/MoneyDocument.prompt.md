The two money documents (M7.DS.02 AC 5, 6; Map D-02, D-12), one layout for the screen and the PDF.

```jsx
<MoneyDocument kind="invoice-ready" counterparty="Riverbend Milling" reference="IPR-0009" generated="30 Sep 2026, 17:20 CAT"
  fields={[['Period', 'September 2026'], ['Contract', 'SYN4845']]} columns={[...]} rows={[...]} />
<MoneyDocument kind="settlement-statement" counterparty="Lakeview Farms Ltd" reference="STL-0142" ... />
```

- `kind` fixes the title and label: Invoice-ready data with Not a tax invoice in the header and the footer, or Settlement statement. Neither can be passed in.
- No invoice number, and no issue, send or fiscalise control: there is no slot for an action. The tax invoice is raised outside One Link.
- A settlement statement is a statement only. Any bank detail field is dropped (`BANK_FIELD`), and the document never calls itself anything but Settlement statement.
- Export and Download sit on the page around the preview.

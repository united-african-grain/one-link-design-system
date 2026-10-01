Use `Field` around every form control: label above, the control, then a hint or an error. An error is the S57 validation pattern, "[Field] [requirement].", under the field it belongs to, for example "Effective from must be now or later." Never put validation in a banner or a toast.

```jsx
<Field label="Effective from" error="Effective from must be now or later.">
  <Input defaultValue="25 Sep 2026, 00:00 CAT" invalid />
</Field>
<Field label="Applies to"><Select options={['Default', 'Commodity form: bagged']} /></Field>
<Field label="Reason"><Input multiline /></Field>
```

`RadioList` is the switch pattern's alternatives: one selected, and an alternative that cannot be chosen yet stays visible but disabled with its `reason` under it.

```jsx
<RadioList value="oldest" options={[
  { value: 'oldest', label: 'Oldest debt first' },
  { value: 'largest', label: 'Largest debt first', disabled: true, reason: 'Needs debt ageing, which arrives with Farmer finance.' },
]} />
```

No explanatory hint lines in Setup dialogs (map UX-23): facts are labelled fields, refusals use the message patterns. The web app's twins are `ol-field`, `input[olInput]`, `textarea[olInput]`, `select[olInput]` inside `ol-select`, and `ol-radio-list`.

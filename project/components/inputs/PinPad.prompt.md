The UAG One Link app's PIN pad (M4.DS.03; S08 J1). Full sign-in happens once while connected; after that the app opens with the phone's PIN or fingerprint. Use it to set the PIN, to open the app with it, and after switching from the fingerprint.

```jsx
<PinPad entered={digits.length} onDigit={add} onDelete={removeLast} />
<PinPad entered={4} busy />                                              // checking
<PinPad entered={0} wrong={2} error="That PIN is not right. 3 tries left." fingerprint onFingerprint={useFingerprint} />
<PinPad entered={0} wrong={5} />                                         // locked: every key disabled
```

- The pad holds no PIN. The screen keeps the digits and passes `entered`; the dots show only how many.
- After the fifth wrong PIN (`PIN_MAX_TRIES`) every key is disabled and stays so. The screen says what to do next with `Refusal`: "PIN entry is not allowed. Sign in again with your email and password."
- `busy` disables the keys and shows the spinner while the PIN is checked or saved.
- Keys are the system's buttons (outline digits, ghost fingerprint and delete). No decoration.

The Flutter twin, `OlPinPad` in one-link-mobile `lib/ds`, is ported by the feature card that first needs it, with the same limit.

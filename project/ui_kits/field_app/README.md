# UI kit: Field app (390 only)

Offline-first driver flow. `DeliveryProof.jsx` covers all three steps (Photo · Sign · Send) and both states: online (Send now) and offline queued (`refresh-cw 1 waiting to send`, action reads "Send when signal returns" and the busy state persists).

`index.html` renders the online and offline phones side by side; the commit button advances the steps.

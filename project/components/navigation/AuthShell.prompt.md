One Link signed-out frame: the form on the left, the brand panel on the right. Sign in, forgot password and set password all render inside it. `AppShell` is the signed-in frame; this is its counterpart before there is a session.

The left half is unchanged from the plain signed-out column: lockup, heading, one sentence, the form, the ways back, centred as a group with `align-items: safe center`. The right half is the system's one documented exception to "no decorative imagery", and it holds only the product name, what One Link is, and the system's own vocabulary. Never a counterparty or person name, a ref, money, tonnes, a price, a position, a site, a date, a preview of an internal screen or seeded data. The ticks along the foot are a rhythm at one fixed height, from a fixed seed, never magnitudes: a bar that varied with a value would read as a chart of real figures.

Below 1024px the panel is removed entirely and the form owns the screen.

```jsx
<AuthShell
  heading="Sign in"
  sentence="Use the email and password for your United African Grain account."
  links={<><Button variant="ghost" size="small">Forgot password</Button><Button variant="ghost" size="small">Back to home</Button></>}
>
  …the fields…
  <PressButton kind="large" variant="primary" fullWidth>Sign in</PressButton>
</AuthShell>
```

`claim`, `claimSentence` and `eyebrow` already default to the approved words, so a consumer gets the approved panel by passing nothing. `showPanel={false}` drops it at every width (a screen that wants the plain column).

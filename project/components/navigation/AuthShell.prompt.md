One Link signed-out frame: one column, centred as a group, and nothing else on the screen. Sign in, forgot password and set password all render inside it. `AppShell` is the signed-in frame; this is its counterpart before there is a session.

The column is the lockup, the heading, one sentence, the form and the row of ways back, at most 400px wide, with `align-items: safe center` so a tall column stays reachable on a short screen. There is no decoration: "no decorative imagery" holds on this surface as it does on every other one, and a screen whose only job is to let somebody in is the whole screen.

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

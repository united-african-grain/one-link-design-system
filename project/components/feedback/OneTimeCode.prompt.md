Use `OneTimeCode` the moment a code is issued: a new user's activation code, or a reissued one for a locked or expired user. It shows the code once, large and grouped for reading out over the phone, with Copy, and its expiry as a labelled date and time.

```jsx
{code ? <OneTimeCode code={code} expires="28 Sep 2026, 09:15 CAT" onDone={() => setCode(null)} /> : null}
```

The component holds nothing. The calling screen keeps the code in its own state only until Done, and then it is gone: the user record offers **Reissue activation code**, never "Show code". No email is sent, and there is no explanatory line such as "Give this code in person" (map UX-23). The web app's twin is `ol-one-time-code`.

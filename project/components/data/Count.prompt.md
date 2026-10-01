Use `Count` beside a list's title and in a card's header: Settings 27, Values 3. A list or card with nothing to show keeps its title and its count, 0, over "No [objects] to display." (map UX-15). The web app's twin is `ol-count`.

```jsx
<span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}><Text as="h1" variant="heading-2" strong>Settings</Text><Count>27</Count></span>
```

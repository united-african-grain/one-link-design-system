Use `Count` only where a board draws one, in a card header that shows part of a list and says what it counts: Items to approve 2 · View all. A count says what it counts, or goes (fix list 129, agreed 4 Nov 2026): never a bare number beside a page title, and a card whose rows sit right under its heading (a note's Lines) needs none. An empty list reads its own plain words with no count and no tick. The web app's twin is `ol-count`; its design check fails on `<ol-count` inside a page head.

```jsx
<Card title="Items to approve" headerRight={<span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Count>2</Count><a href="#">View all</a></span>} />
```

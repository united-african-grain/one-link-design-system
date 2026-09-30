One Link reading frame, for the help centre: a screen of its own outside the app, so a signed-in reader does not lose their place to read help, with one clear way back. `AppShell` is the app's frame and `AuthShell` the signed-out one; this is the third, and it carries none of the app's furniture: no module rail, no toolbar, no ticker, no bottom bar.

A 56px sticky header (the lockup, a hairline and the frame's label, a `SearchField`, and the way back at the far right, which blurs like the other headers once the page scrolls), the topics down the left (an "All topics" row, then each section's caption-1-condensed label and its pages as 32px body-3 rows, the current one on the grouped fill in strong primary) and the article in the page column at `--shell-max`.

From 1024px the topics are a sticky 260px rail (`--sidebar-w`). Below it they are a 264px drawer behind a **Topics** button at the left of the header, with a scrim, inert when closed and closed by Escape, the scrim, the close button or a choice, the same drawer as the AppShell's, so a list of links never pushes the article down. Below 768px the lockup is the mark alone, the label gives way, and the search takes a full width row under the header, because on a help screen the search is the main way in.

The frame decides nothing about who may read. In One Link help is behind sign-in, and the product guards the route.

```jsx
<DocsShell
  sections={[{ title: 'Getting started', pages: [{ value: 'signing-in', label: 'Signing in' }] }]}
  current="signing-in"
  onNavigate={open}
  search={<SearchField placeholder="Search help" hint={null} maxWidth="none" />}
  back={<Button variant="outline" size="small" icon="arrow-left">Back to One Link</Button>}
>
  …the article…
</DocsShell>
```

The assistant's panel: a small conversation in the corner of the product, 400px wide and 620px tall at the most, radius 20, elevated, shadow-dialog.

The two sides of a turn look nothing alike, and that is the whole of the look. A question is a right-aligned pill in the inverted fill. An answer is not a bubble at all: it is plain body-2 text on the surface, the same setting the help centre uses. Two bubbles facing each other is a chat app, and a chat app asks to be talked to. This is a reference book that was asked a question. Keep the asymmetry.

`open` draws it and runs the opening on the spring from the bottom right corner; under reduced motion it fades instead. `title` and `subtitle` fill the header beside the One Link mark, and `title` is the panel's accessible name. `onClose` and `onRestart` each add a 32px icon button to the header when they are given, and nothing when they are not. `children` is the conversation, an 18px column with a 20px gap. `value`, `onValueChange` and `onSend` drive the composer, a 44px field and a 44px send button in the primary fill; `sending` spins the send button and refuses a second press. `footer` is the line at the foot and has a default, because it is a promise about what the thing does rather than a caption, and it belongs on every instance. `sheet` makes it a full-height sheet with only the top corners rounded, which is what a phone gets, because a 400px panel floating on a 390px screen is a panel with no phone around it. `contained` positions it in the nearest positioned parent, for artboards.

- There is no avatar, no name for the assistant, no typing dots, no rating. The only thing under an answer is where it came from.
- `AssistantSuggestion` rows are full width on grouped-light, radius 16, and carry a real help page title. Never a question somebody invented.
- `AssistantWorking` says what it is doing, not that it is thinking.
- `AssistantAnswer` takes `sources`, which is where `CitationChip` goes.
- The panel draws itself and nothing else. Focus, Escape and the top layer belong to whatever puts it on the screen; in the app that is a native dialog.

```jsx
<AssistantPanel value={q} onValueChange={setQ} onSend={ask} onClose={close} onRestart={restart}>
  <p style={{ margin: 0 }}>Ask how anything in One Link works. Every answer comes from the help centre, and says which page it came from.</p>
  <AssistantSuggestion onClick={() => ask('Two-step sign-in')}>Two-step sign-in</AssistantSuggestion>
  <AssistantQuestion>Why is my position figure greyed out?</AssistantQuestion>
  <AssistantAnswer sources={<CitationChip label="The modules, and who can open them" href="/help/modules-and-access" />}>
    A figure reads as a dash with an eye-off mark when your role may not see it.
  </AssistantAnswer>
  <AssistantWorking />
</AssistantPanel>
<AssistantPanel sheet />
```

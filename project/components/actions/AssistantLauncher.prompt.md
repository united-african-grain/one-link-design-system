The way into the assistant, and the only thing it leaves on the screen while it is shut: a 44px pill in the inverted fill with an icon and one word.

One word rather than a bare circle, because a circle with a mark in it is a guess and the word says what pressing it gets you. The mark is `message-square`, the chat icon, and not `sparkles`: sparkles is this system's mark for a model and belongs to Ask AI, which reads the business. This is a place to ask a question about how the product works. Inverted rather than brand blue, because it is a door and not a decision, and the brand fill in One Link belongs to the things that commit something. It floats, so it carries shadow-strong, the same elevation as every other large action that sits over the page.

Where it goes is the frame's business: the component never positions itself. In the app that means the bottom right corner, clear of the bottom ticker on a desktop and clear of the module bar on a phone.

```jsx
<AssistantLauncher onClick={open} expanded={open} />
<AssistantLauncher label="Guide" icon="message-square" />
```

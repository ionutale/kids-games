# Kids Games — Domain Glossary

## Puzzle Game

- **Puzzle**: An image divided into multiple solvable fragments (Pieces).
- **Piece**: A single fragment of the Puzzle, featuring traditional interlocking edges (tabs and blanks), generated dynamically at runtime via SVG paths.
- **Board**: The fixed area showing a faded ghost image where Pieces are assembled. Scales to device screen with Aspect Ratio Preservation using letterboxing.
- **Target Position**: The absolute, predetermined coordinates on the Board where a specific Piece must be dropped to snap into place.
- **Tray**: A designated UI area holding unplaced Pieces. Auto-refills — holds a limited number at a time, slides in new ones when slots open.
- **Snap Radius**: An invisible, forgiving boundary around a Target Position. If a Piece is dropped within it, it auto-locks into its Target Position.
- **Difficulty Level**: A selectable configuration (Easy/Medium/Hard) determining Piece count and Snap Radius size.
- **Source Image**: The complete image that is dynamically sliced into Pieces at runtime.
- **Idle Nudge**: An automatic visual hint (jiggling a Piece + highlighting its Target Position) triggered after 8s of inactivity.
- **Celebration Sequence**: Multi-stage visual + audio reward triggered when the final Piece is placed, requiring manual input to proceed.
- **Progress State**: Saved status of an ongoing Puzzle (Source Image, Difficulty, placed Pieces) stored in localStorage.
- **Fixed Orientation**: Pieces are always upright — no rotation mechanics.
- **Open Gallery**: Visual menu with image thumbnails letting users freely select any Puzzle.
- **Positive-Only Audio**: Successful snap → satisfying sound. Failed drop → silence. No punitive sounds.
- **Parental Gate**: 3-tap- within-3s required to exit an active puzzle.
- **Monochrome Blueprint**: Ghost image on the Board rendered in heavily washed-out greyscale.
- **Single-Touch Lock**: Only one touch registered during a drag — resting palms ignored.
- **Drag Offset and Magnify**: Dragged Piece scales up 1.12× and shifts above the touch point.
- **Flat Borders**: Outer-perimeter Pieces have straight external edges.
- **Permanent Lock**: Snapped Pieces ignore all future touch events.

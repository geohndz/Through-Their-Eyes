import dog1 from '../../../audio/tracks/eng/dog/dog1.mp3'
import dog2 from '../../../audio/tracks/eng/dog/dog2.mp3'
import dog3 from '../../../audio/tracks/eng/dog/dog3.mp3'
import type { NarrationSet } from '../../types/narration'

export const engDog: NarrationSet = {
  visionId: 'dog',
  locale: 'eng',
  tracks: [
    {
      src: dog1,
      delayBeforeMs: 2000,
      script:
        "Welcome to the world through a dog's eyes. Dogs don't see the same rainbow of colors that we do. Instead of three types of color receptors like humans, they have only two. Reds and greens become much harder to distinguish, while blues and yellows remain much more vivid.",
    },
    {
      src: dog2,
      delayBeforeMs: 2000,
      script:
        "Try looking at something that's red, then something that's blue. Notice how one stands out much more than the other.",
    },
    {
      src: dog3,
      delayBeforeMs: 2000,
      script:
        "This kind of vision is called dichromatic vision, and it's shared by wolves, foxes, and many other members of the dog family. Even though dogs see fewer colors, they're excellent at detecting movement—an adaptation that helps them track prey and notice changes in their surroundings.",
    },
  ],
}

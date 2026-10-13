Optional future models go here: player.glb, kage.glb, etc.

No model files are required. In src/main.ts, import replacePlayerModel from player-model.ts and call replacePlayerModel(player, '/models/player.glb') after creating the player Group. Keep the placeholder call first as a fallback. Models should face +Z with Y up; the loader normalizes their height to 2.06 units and places their feet at Y=0. Movement stays on the parent Group. Rigging and animations are outside this prototype.

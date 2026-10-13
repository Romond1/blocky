/** Browser-language instructions. Puzzle glyphs and answer words deliberately stay English. */
export type InstructionLocale='en'|'ja';
export function resolveInstructionLocale(languages:readonly string[]):InstructionLocale {
 for(const language of languages){const base=language.toLowerCase().split(/[-_]/)[0];if(base==='ja'||base==='en')return base;}
 return 'en';
}
export const instructionLocale=resolveInstructionLocale(typeof navigator==='undefined'?['en']:navigator.languages?.length?navigator.languages:[navigator.language]);
const ja:Record<string,string>={
 'Sound on':'音を出す','Sound off':'音を消す',
 'Play video':'動画を再生','Continue playing':'ゲームを続ける','Tap Play video to watch with sound.':'「動画を再生」を押すと音付きで見られるよ。','Video could not load. Try again or continue playing.':'動画を読み込めませんでした。もう一度試すか、ゲームを続けてね。',
 'Click the flashing Switch hero button.':'光っているヒーロー交代ボタンを押そう。','Or press':'またはキーで：',
 'Click the buttons, or use E to pick up / place and Q / Tab to switch.':'画面のボタンでも、E キーで持つ・おく、Q / Tab キーで交代できるよ。',
 'Place':'おく','Action':'アクション','Jump':'ジャンプ',
 'WASD / arrows: move · Drag: look · Space: jump · E: action · Q / Tab: hero · R: reset · You can also click the action buttons.':'WASD・矢印：移動・ドラッグ：まわりを見る・Space：ジャンプ・E：持つ、おく、使う・Q / Tab：交代・R：やりなおす・画面のボタンでも操作できるよ。',
 'Ride the lift. Walk onto the upper landing.':'リフトに乗って、上の足場へ進もう。',
 'Bring both heroes and the Heart onto the lift. No hurry.':'二人とハートをリフトに乗せよう。時間制限はないよ。',
 'Step on the lower lift pad, then bring both heroes and the Heart aboard.':'下のリフトの台をふもう。二人とハートをリフトに乗せよう。',
 'The Heart bridge is open. Return to the golden Heart.':'ハートへの橋が開いたよ。金色のハートへもどろう。','Hold the carousel pad. Complete the three word puzzles.':'台に乗って回転を止めよう。三つの言葉のパズルを完成させよう。',
 'One hero holds the pad. Switch heroes and jump across.':'一人は台の上で待とう。ヒーローを交代して、ジャンプでわたろう。',
 'Go to any room':'好きな部屋へ移動','Go to room':'この部屋へ移動','Teacher room visits do not unlock player progress.':'先生用の部屋移動では、プレイヤーの進行状況は変わりません。',
 'Choose your next adventure.':'次の冒険をえらぼう。',
 'Restart this room’s puzzle? Your unlocked rooms and collected treasures stay saved.':'この部屋のパズルをはじめからやりなおす？ 行った部屋や集めた宝物は消えないよ。',
 'The Training Chamber':'はじめの部屋','The Strength Chamber':'力もちの部屋','The Split Chamber':'二つの力の部屋','The Cooperation Chamber':'協力の部屋','The Fruit Lift':'くだものリフト','The Sorting Foundry':'色とくだものの部屋','The Action Chamber':'動きの部屋','The Ability Hall':'ヒーローのできること','The Heart Gauntlet':'ハートの試練','The Dragon’s Cave':'ドラゴンの洞くつ',
 'Complete HERO. Yuki lifts HEAVY.':'HERO を完成させよう。HEAVY はユキにまかせよう。','Restore both heroes’ powers.':'二人のヒーローの力を取りもどそう。','Hold the plates. Escape together.':'台を押さえて、二人で脱出しよう。','Match each word to its fruit.':'言葉をくだものの絵に合わせよう。','Match the colors and fruit.':'色とくだものの言葉を合わせよう。','Match RUN, JUMP and LIFT.':'RUN・JUMP・LIFT を絵に合わせよう。','Build the heroes’ sentences.':'ヒーローの文を作ろう。','Carry the Heart through four challenges.':'四つの試練をこえてハートを運ぼう。','Carry the Heart to the altar.':'ハートを祭壇へ運ぼう。',
 'Left stick: move · Drag the right side: look · JUMP: hop · ACTION: pick up, place or use · HERO: switch heroes':'左スティック：移動・右側をドラッグ：まわりを見る・ジャンプ：とぶ・アクション：持つ、おく、使う・ヒーロー：交代',
 'WASD / arrows: move · Drag: look · Space: jump · E: action · Tab: hero · R: reset':'WASD・矢印：移動・ドラッグ：まわりを見る・Space：ジャンプ・E：持つ、おく、使う・Tab：交代・R：やりなおす',
 'Mia runs fast. Yuki lifts heavy blocks. Work together!':'ミアは足が速い。ユキは重いブロックを持てる。二人で力を合わせよう！',
 'Menu':'メニュー','Keep playing':'ゲームにもどる','Reset Room':'この部屋をやりなおす','Adventure paused':'ひと休み',
 'Replay unlocked rooms':'行ったことのある部屋で遊ぶ','Controls':'操作方法','Graphics':'画質','Automatic':'自動','Touch':'タッチ','Keyboard & mouse':'キーボードとマウス',
 'Battery saver':'省電力','Full detail':'高画質','How to play':'遊び方',
 'HERO':'ヒーロー','ACTION':'アクション','JUMP':'ジャンプ',
 'Move the left stick to walk':'左のスティックで歩こう','Drag the right side to look around':'画面の右側を動かしてまわりを見よう',
 'HERO · Switch to your teammate':'ヒーロー：もう一人に交代しよう','ACTION · Place your block':'アクション：ブロックをおこう','ACTION · Pick up a block':'アクション：ブロックを持とう',
 'JUMP to hop · ACTION to pick up · HERO to switch':'ジャンプでとぶ・アクションで持つ・ヒーローで交代',
 'TURN YOUR PHONE SIDEWAYS!':'スマホを横にしよう！',
 'Heroes need a bigger view of the adventure! Turn your phone sideways to begin!':'冒険を広く見わたそう！ スマホを横にしてはじめよう！',
 'YOUR MISSION':'今回のミッション',
 'Drop on the plate':'台におく',
 'SWITCH HERO':'ヒーローを交代しよう', 'Try playing as your teammate.':'もう一人のヒーローを動かしてみよう。', 'Press TAB to switch hero':'TAB キーでヒーローを交代する', 'Activate both pressure plates.':'二つの台を光らせよう。', 'Complete H _ R O on the letter plate.':'文字の台で H _ R O を完成させよう。', 'Place HEAVY on its plate. Either order works.':'HEAVY を専用の台にのせよう。どちらからでもいいよ。',
 'YOUR TASKS':'やることリスト',
 'Both heroes escaped!':'二人そろって脱出できたね！',
 'ROOM ESCAPED! Training complete.':'脱出成功！ トレーニングをクリアしたよ。',
 'TOO HEAVY FOR MIA':'ミアには重すぎる！',
 'Switch to Yuki':'ユキに交代しよう',
 'Yuki is strong enough to lift HEAVY.':'力もちのユキなら HEAVY を持ち上げられるよ。',
 'YUKI IS SUPER STRONG!':'ユキはとっても力もち！',
 'YUKI CAN LIFT THIS':'ユキなら持ち上げられるよ！',
 'Switch hero whenever you want':'いつでもヒーローを交代できるよ',
 'Drop / place ·':'おく・台にのせる ·',
 'Switch hero':'ヒーローを交代',
 'Try lifting':'持ち上げてみよう',
 'Pick up':'持ち上げる',
 'Your teammate is on the way.':'もう一人のヒーローが来るのを待とう。',
 'ESCAPE TOGETHER':'二人で出口へ！',
 'Both heroes through the glowing doorway.':'二人そろって、光るドアを通ろう。',
 'MOVE':'動いてみよう',
 'Forward, left, back, right · arrows work too':'前・左・後ろ・右へ。矢印キーでも動けるよ。',
 'LOOK AROUND':'まわりを見てみよう',
 'Hold the left mouse button and drag':'マウスの左ボタンを押したまま動かそう。',
 'COMPLETE H _ R O':'H _ R O のあいているところは？',
 'Find the missing letter. Place it on the glowing plate.':'足りない文字を見つけて、光る台にのせよう。',
 'E picks up / places · TAB switches hero.':'E：持ち上げる・おく　TAB：ヒーローを交代',
 'POWER BOTH PLATES':'二つの台を光らせよう！',
 'Complete H _ R O on the left.':'左の台に文字をのせて H _ R O を完成させよう。',
 'Place HEAVY on the right. Explore in any order.':'右の台には HEAVY をのせよう。どちらからでもいいよ。',
 '[TAB] SWITCH HERO':'[TAB] ヒーローを交代',
 'SUPER STRONG':'とっても力もち', 'SUPER FAST':'とっても速い',
 'Reset · R':'やりなおす · R', 'Debug · `':'デバッグ · `', 'REPLAY ROOM':'部屋をえらぶ',
 'WASD / arrows':'WASD・矢印キー', 'Move':'移動', 'Drag mouse':'マウスをドラッグ', 'Look around':'まわりを見る', 'Pick up / drop':'持ち上げる・おく', 'Fullscreen':'全画面',
 '01 / THE TRAINING CHAMBER':'01 / はじめの部屋', '02 / THE STRENGTH CHAMBER':'02 / 力もちの部屋', '03 / THE POWER CHAMBER':'03 / ヒーローの力の部屋',
 'Complete HERO. Power the doorway.':'HERO を完成させて、ドアを開けよう。', 'Two plates. One team.':'二つの台。二人で力を合わせよう。',
 'Power is flowing to the door! Escape together.':'光がドアに向かっているよ！ 二人で出口へ進もう。',
 'HERO! One plate powered.':'HERO！ 一つの台が光ったよ。', 'Heavy plate powered. Complete HERO on the left.':'HEAVY の台が光ったよ。左の台で HERO を完成させよう。',
 'Try another block. Find the missing letter in HERO.':'別のブロックを試そう。HERO に足りない文字は何かな？',
 'Try another block. E goes left; HEAVY goes right.':'別のブロックを試そう。E は左、HEAVY は右の台だよ。',
 'Set your block down first. Yuki can lift the heavy one.':'まず持っているブロックをおこう。重いブロックはユキが持ち上げられるよ。',
 'Move into a little more space to drop the block.':'もう少し広いところに移動してから、ブロックをおこう。',
 'MIA IS SUPER FAST!':'ミアはとっても速い！', 'PRESS TAB TO SWITCH HERO':'TAB キーでヒーローを交代しよう',
 'Try to move with the heavy block':'重いブロックを持って動いてみよう', 'Lift!':'持ち上げよう！', 'Walk through the glowing doorway':'光るドアを通ろう', 'Walk up to a letter block':'文字のブロックに近づこう',
 '[E] Drop':'[E] おく', '[E] Place in the answer slot':'[E] 台にのせる', '[E] Swap with the answer slot':'[E] 台のブロックと入れかえる',
 'Room complete · R to play again':'クリア！ R キーでもう一度', 'TRAINING COMPLETE':'トレーニング クリア！', 'ROOM 01 COMPLETE':'部屋 01 クリア！', 'ROOM 02 COMPLETE':'部屋 02 クリア！', 'ROOM ESCAPED!':'脱出成功！',
 'You escaped the first room!':'はじめの部屋から脱出できたね！', 'You escaped the Strength Chamber!':'力もちの部屋から脱出できたね！',
 'A hero finds a way. Press R to play again.':'よくできたね！ R キーでもう一度遊べるよ。',
 'Three training rooms complete. You’re ready for the adventure.\nPress R to replay this room.':'三つの部屋をクリア！ さあ、冒険に出かけよう。\nR キーでもう一度遊べるよ。',
 'THE STRENGTH CHAMBER — Complete HERO and let Yuki place HEAVY.':'力もちの部屋 — HERO を完成させて、ユキで HEAVY を台にのせよう。',
 'THE POWER CHAMBER — Two locks. Restore the heroes’ powers.':'ヒーローの力の部屋 — 二つのカギを開けて、ヒーローの力を取りもどそう。',
 'REMEMBER YOUR HEROES':'ヒーローのことを思い出そう', 'ONE MORE MEMORY...':'もう一つ、思い出してみよう…',
 'MIA IS SUPER ____.   YUKI IS SUPER ____.':'ミアとユキの得意なことに合う英語のブロックを探そう。',
 'WHEN DID MIA AND YUKI FIND THEIR ARMOR?':'ミアとユキがよろいを見つけたのは、第何話かな？',
 'Restore the heroes’ powers to activate this station.':'まずヒーローの力を取りもどして、この台を動かそう。',
 'This station needs power. Solve the heroes first.':'まずヒーローの問題を解いて、この台に力を送ろう。',
 'The armor-memory station is awake. Find an episode block.':'次の台が動きだしたよ。話数のブロックを探そう。',
 'Explore the chamber. Find words for Mia and Yuki.':'部屋を探検して、ミアとユキに合う言葉を探そう。',
 'POWER RESTORED!':'力がもどった！', 'That doesn’t sound right...':'ちょっとちがうみたい…', 'Not that episode...':'その話ではないみたい…', 'EPISODE 1 — CORRECT!':'第1話 — 正解！',
 'Fullscreen is unavailable in this browser.':'このブラウザーでは全画面にできません。', 'Graphics paused. Reload the page to restart.':'画面が止まりました。ページを読みこみなおしてください。',
 'Replay a training room':'もう一度遊ぶ部屋をえらぶ',
 'Restart Room 1 — The Volcano Room':'部屋1をはじめから遊ぶ', 'Restart Room 2 — The Strength Chamber':'部屋2をはじめから遊ぶ', 'Restart Room 3 — The Power Chamber':'部屋3をはじめから遊ぶ',
 'Block World Escape. WASD or arrows to move, drag mouse to look, E to pick up or drop.':'ブロックワールド・エスケープ。WASD・矢印キーで移動、マウスをドラッグしてまわりを見る、E で持ち上げる・おく。',
 'Every escape':'冒険はいつも', 'starts with a hero.':'ヒーローから始まる。', 'Choose your hero. Enter the volcano. Find a way out.':'ヒーローをえらんで、火山の部屋から脱出しよう。',
 'Play as Yuki':'ユキで遊ぶ', 'Play as Mia':'ミアで遊ぶ', 'Two heroes. The same adventure.':'二人のヒーロー。一つの冒険。',
 'Blue steel · Cyan energy':'青いよろい・水色の光', 'Crimson armor · Golden fire':'赤いよろい・金色の炎'
};
const hero=(name:string)=>name.toLowerCase()==='yuki'?'ユキ':name.toLowerCase()==='mia'?'ミア':name;
export function instruction(text:string,locale:InstructionLocale=instructionLocale):string {
 if(locale==='en')return text;
 const source=text.trim();let translated=ja[source];let match:RegExpMatchArray|null;
 if(!translated){
  if((match=source.match(/^(\d+)( \/ |\. )(.+)$/))&&ja[match[3]])translated=`${match[1]}${match[2]}${ja[match[3]]}`;
  else if((match=source.match(/^CARRYING (.+)$/)))translated=`${match[1]} を持っているよ`;
  else if((match=source.match(/^WAIT FOR (.+)$/)))translated=`${hero(match[1])}を待とう`;
  else if((match=source.match(/^Wait for (Mia|Yuki)!$/)))translated=`${hero(match[1])}を待とう！`;
  else if((match=source.match(/^(\[E\] )?Pick up (.+)$/)))translated=`${match[1]??''}${match[2]} を持ち上げる`;
  else if((match=source.match(/^Try lifting (.+)$/)))translated=`${match[1]} を持ち上げてみよう`;
  else if((match=source.match(/^\[E\] (Swap|Place) (.+) answer$/)))translated=`[E] ${match[2]} の答えを${match[1]==='Swap'?'入れかえる':'のせる'}`;
  else if((match=source.match(/^(MIA|YUKI) — correct!$/)))translated=`${hero(match[1])} — 正解！`;
  else if(source.startsWith('LOCK 1 '))translated=source.replaceAll('LOCK','カギ');
 }
 return translated?text.replace(source,translated):text;
}
/** Translate presentation only; game state and the English-learning puzzle are untouched. */
export function localizeInstructions(root:HTMLElement){
 if(instructionLocale==='en')return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null;
 while((node=walker.nextNode())){if(node.parentElement?.closest('#debug, .word:not(.memory-word), .welcome'))continue;const value=instruction(node.nodeValue??'');if(value!==node.nodeValue)node.nodeValue=value;}
 for(const element of Array.from(root.querySelectorAll('[aria-label],[title]')))for(const attr of ['aria-label','title']){const value=element.getAttribute(attr);if(value){const translated=instruction(value);if(translated!==value)element.setAttribute(attr,translated);}}
}

const inputText=new WeakMap<Node,{source:string;rendered:string}>();
/** Adapt only HUD instruction text; never puzzle labels or world glyphs. */
export function adaptControlHints(root:HTMLElement,touch:boolean){
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let node:Node|null;
 while((node=walker.nextNode())){
  if(node.parentElement?.closest('#debug,.word,.room-status'))continue;
  const text=node.nodeValue??'',saved=inputText.get(node),source=saved&&saved.rendered===text?saved.source:text;
  const rendered=touch?source.replace(/Q \/ Tab/g,'HERO').replace(/\[E\]/g,'[ACTION]').replace(/\[TAB\]/gi,'[HERO]').replace(/\bTAB\b|\bTab\b/g,'HERO').replace(/\bSpace\b/g,'JUMP').replace(/\bE(?=\s|：|$)/g,'ACTION').replace(/\bR(?=\s|$)/g,'Reset Room').replace(/キーで/g,'で'):source;
  if(rendered!==text)node.nodeValue=rendered;inputText.set(node,{source,rendered});
 }
}

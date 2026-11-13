/* Exercise library: every swap option, grouped by muscle. Format per line: Name|pattern|cue|cue */
Object.assign(P, {
  legext: { A: { h: [46, 38], s: [46, 50], e: [52, 66], w: [58, 80], p: [48, 82], k: [72, 82], f: [72, 108] }, B: { f: [98, 80] }, props: ['seat'], tempo: [1, 1, 2], ph: ['Extend', 'Squeeze', 'Lower slow'] }
});

/* ---- figures for moves the base set didn't cover ---- */
Object.assign(P, {
  pushup: { A: { h: [22, 68], s: [32, 76], e: [33, 92], w: [32, 108], p: [68, 88], k: [88, 98], f: [108, 108] }, B: { h: [18, 94], s: [30, 99], e: [46, 92], p: [68, 102], k: [88, 105] }, props: ['floor'], tempo: [2, 0, 1], ph: ['Lower', '', 'Push up'] },
  inclinepress: { A: { h: [22, 48], s: [31, 61], e: [40, 48], w: [47, 32], p: [54, 86], k: [76, 82], f: [82, 110] }, B: { e: [24, 78], w: [40, 60] }, props: ['floor', 'ibench', 'db:w'], tempo: [3, 1, 1], ph: ['Lower', 'Pause', 'Press'] },
  seatedpress: { A: { h: [50, 28], s: [50, 40], e: [38, 52], w: [42, 36], p: [50, 82], k: [74, 82], f: [76, 110] }, B: { e: [46, 20], w: [50, 4] }, props: ['floor', 'chair', 'db:w'], tempo: [1, 1, 2], ph: ['Press up', 'Lockout', 'Lower'] },
  pulldown: { A: { h: [52, 30], s: [52, 42], e: [56, 24], w: [58, 6], p: [52, 84], k: [76, 84], f: [78, 110] }, B: { h: [50, 30], e: [40, 52], w: [54, 38] }, props: ['floor', 'stool', 'cable:w:58:-12', 'db:w'], tempo: [1, 1, 2], ph: ['Pull down', 'Squeeze', 'Control up'] },
  pushdown: { A: { h: [58, 18], s: [58, 30], e: [60, 48], w: [74, 38], p: [58, 62], k: [59, 86], f: [58, 110] }, B: { w: [66, 66] }, props: ['floor', 'cable:w:86:-8'], tempo: [1, 1, 2], ph: ['Push down', 'Squeeze', 'Return'] },
  ohext: { A: { h: [60, 18], s: [60, 30], e: [58, 8], w: [46, 20], p: [60, 62], k: [61, 86], f: [60, 110] }, B: { w: [60, -10] }, props: ['floor', 'db:w'], tempo: [1, 1, 2], ph: ['Extend', 'Squeeze', 'Lower slow'] },
  skull: { A: { h: [16, 70], s: [28, 74], e: [30, 54], w: [30, 36], p: [72, 74], k: [90, 72], f: [98, 110] }, B: { w: [12, 58] }, props: ['floor', 'bench:14:86:78', 'barbell:w'], tempo: [2, 0, 1], ph: ['Lower', '', 'Extend'] },
  pullover: { A: { h: [16, 70], s: [28, 74], e: [30, 56], w: [30, 38], p: [72, 74], k: [90, 72], f: [98, 110] }, B: { e: [14, 60], w: [4, 64] }, props: ['floor', 'bench:14:86:78', 'db:w'], tempo: [2, 1, 1], ph: ['Stretch back', 'Pause', 'Pull over'] },
  seatedfly: { A: { h: [50, 28], s: [50, 40], e: [40, 46], w: [30, 42], p: [50, 82], k: [74, 82], f: [76, 110] }, B: { e: [62, 46], w: [76, 42] }, props: ['floor', 'chair'], tempo: [1, 1, 2], ph: ['Squeeze in', 'Hold', 'Open slow'] },
  bridge: { A: { h: [14, 104], s: [26, 106], e: [40, 108], w: [54, 108], p: [60, 104], k: [80, 84], f: [90, 108] }, B: { p: [60, 86], k: [82, 80] }, props: ['floor'], tempo: [1, 2, 2], ph: ['Hips up', 'Squeeze', 'Lower'] },
  lyingraise: { A: { h: [14, 104], s: [26, 106], e: [40, 108], w: [54, 108], p: [62, 104], k: [86, 104], f: [110, 104] }, B: { k: [66, 80], f: [70, 56] }, props: ['floor'], tempo: [1, 1, 2], ph: ['Raise', 'Hold', 'Lower slow'] },
  situp: { A: { h: [14, 102], s: [26, 104], e: [18, 94], w: [12, 100], p: [62, 104], k: [80, 84], f: [96, 106] }, B: { h: [50, 64], s: [52, 78], e: [44, 68], w: [48, 62] }, props: ['floor'], tempo: [1, 1, 2], ph: ['Sit up', 'Squeeze', 'Lower'] },
  sideplank: { A: { h: [22, 72], s: [30, 82], e: [30, 108], w: [44, 108], e2: [32, 66], w2: [34, 50], p: [66, 98], k: [88, 104], f: [108, 108] }, B: { p: [66, 92] }, props: ['floor'], tempo: [2, 1, 2], ph: ['Lift hips', 'Hold', 'Lower'] },
  backext: { A: { h: [32, 98], s: [38, 88], e: [44, 92], w: [40, 84], p: [60, 70], k: [76, 87], f: [92, 104] }, B: { h: [26, 34], s: [34, 42], e: [42, 46], w: [38, 38] }, props: ['floor', 'pad45'], tempo: [1, 1, 2], ph: ['Raise', 'Squeeze', 'Lower'] },
  uprow: { A: { h: [60, 18], s: [60, 30], e: [60, 46], w: [62, 62], p: [60, 62], k: [61, 86], f: [60, 110] }, B: { e: [46, 24], w: [60, 34] }, props: ['floor', 'barbell:w'], tempo: [1, 1, 2], ph: ['Pull up', 'Squeeze', 'Lower'] },
  frontraise: { A: { h: [60, 18], s: [60, 30], e: [60, 46], w: [62, 62], p: [60, 62], k: [61, 86], f: [60, 110] }, B: { e: [76, 32], w: [92, 30] }, props: ['floor', 'db:w'], tempo: [1, 1, 2], ph: ['Raise', 'Hold', 'Lower slow'] },
  jack: { A: { h: [60, 18], s: [60, 30], e: [52, 46], w: [50, 60], e2: [68, 46], w2: [70, 60], p: [60, 62], k: [57, 86], f: [56, 110], k2: [63, 86], f2: [64, 110] }, B: { e: [44, 16], w: [38, 0], e2: [76, 16], w2: [82, 0], k: [48, 84], f: [38, 108], k2: [72, 84], f2: [82, 108] }, props: ['floor'], tempo: [.4, 0, .4], ph: ['Out', '', 'In'] },
  jumprope: { A: { h: [60, 18], s: [60, 30], e: [52, 46], w: [44, 54], e2: [68, 46], w2: [76, 54], p: [60, 62], k: [60, 86], f: [60, 110] }, B: { h: [60, 11], s: [60, 23], e: [52, 39], w: [44, 47], e2: [68, 39], w2: [76, 47], p: [60, 55], k: [60, 79], f: [60, 103] }, props: ['floor'], tempo: [.3, 0, .3], ph: ['Hop', '', 'Hop'] },
  bike: { A: { h: [64, 36], s: [58, 48], e: [70, 58], w: [84, 60], p: [44, 74], k: [64, 80], f: [60, 102], k2: [62, 72], f2: [72, 92] }, B: { k: [62, 72], f: [72, 92], k2: [64, 80], f2: [60, 102] }, props: ['bike'], tempo: [.5, 0, .5], ph: ['Pedal', '', 'Pedal'] },
  rower: { A: { h: [52, 50], s: [50, 62], e: [62, 66], w: [76, 68], p: [44, 90], k: [62, 72], f: [84, 92] }, B: { h: [36, 48], s: [36, 60], e: [30, 72], w: [46, 70], p: [40, 90], k: [66, 86] }, props: ['floor', 'cable:w:108:72'], tempo: [1, .3, 1.5], ph: ['Drive', 'Finish', 'Recover'] },
  burpee: { A: { h: [60, 18], s: [60, 30], e: [62, 46], w: [64, 62], p: [60, 62], k: [61, 86], f: [60, 110] }, B: { h: [22, 70], s: [32, 76], e: [32, 92], w: [32, 108], p: [68, 86], k: [88, 97], f: [108, 108] }, props: ['floor'], tempo: [1, 0, 1], ph: ['Drop', '', 'Jump up'] },
  sled: { A: { h: [72, 46], s: [66, 56], e: [78, 60], w: [92, 62], p: [44, 72], k: [58, 90], f: [44, 110], k2: [34, 90], f2: [20, 108] }, B: { k: [34, 90], f: [20, 108], k2: [58, 90], f2: [44, 110] }, props: ['floor', 'sled'], tempo: [.5, 0, .5], ph: ['Drive', '', 'Drive'] },
  ropes: { A: { h: [58, 34], s: [56, 46], e: [68, 56], w: [80, 46], p: [46, 74], k: [62, 88], f: [56, 110] }, B: { w: [80, 70] }, props: ['floor', 'rope:w'], tempo: [.3, 0, .3], ph: ['Slam', '', 'Lift'] },
  latlunge: { A: { h: [60, 18], s: [60, 30], e: [56, 44], w: [58, 56], p: [60, 62], k: [57, 86], f: [56, 110], k2: [63, 86], f2: [64, 110] }, B: { h: [50, 36], s: [50, 48], e: [48, 62], w: [52, 74], p: [50, 80], k: [36, 90], f: [34, 110], k2: [70, 94], f2: [88, 110] }, props: ['floor'], tempo: [2, 1, 1], ph: ['Step out', 'Sit', 'Push back'] },
  stepup: { A: { h: [60, 30], s: [60, 42], e: [60, 58], w: [60, 72], p: [58, 74], k: [76, 80], f: [76, 96], k2: [56, 94], f2: [52, 110] }, B: { h: [74, 6], s: [74, 18], e: [74, 34], w: [74, 48], p: [74, 50], k: [75, 74], k2: [70, 72], f2: [66, 92] }, props: ['floor', 'box', 'db:w'], tempo: [1, 1, 2], ph: ['Step up', 'Stand tall', 'Lower slow'] },
  rollout: { A: { h: [38, 70], s: [44, 82], e: [42, 94], w: [40, 104], p: [62, 86], k: [70, 108], f: [92, 108] }, B: { h: [16, 92], s: [28, 96], e: [18, 100], w: [8, 104], p: [56, 96] }, props: ['floor', 'plate:w'], tempo: [2, 1, 2], ph: ['Roll out', 'Hold', 'Pull back'] }
});
for (const k in P) P[k].B = { ...P[k].A, ...P[k].B };

const LIB_RAW = {
quads: `Leg Press|legpress|Feet shoulder-width in the middle of the platform|Lower to about 90°, don't lock your knees at the top
Leg Press (feet low & narrow)|legpress|Feet low on the platform puts more work on the quads|Knees track over your toes
Leg Press (feet high & wide)|legpress|Feet high and wide shifts work to the glutes and hamstrings|Press through your heels
Single-Leg Leg Press|legpress|One foot centered, light weight|Fixes side-to-side imbalances
Barbell Back Squat|squat|Brace hard, bar on your upper traps|Hit at least parallel, drive through mid-foot
Front Squat|squat|Bar on your front delts, elbows high|Stay upright, big quad focus
Hack Squat|squat|Feet mid-platform, shoulder width|Go deep, control the descent
Pendulum Squat|squat|Back flat on the pad|Deep range, smooth tempo
Smith Machine Squat|squat|Feet slightly in front of the bar|Full depth, steady tempo
Belt Squat|squat|Load on your hips, zero spine stress|Sit straight down
Goblet Squat|squat|DB at your chest, elbows inside your knees|Sit down between your hips
Heel-Elevated Goblet Squat|squat|Heels on small plates or a wedge|Knees forward for more quads
Box Squat|squat|Sit back to the box, pause, drive up|Great for learning depth
Sumo Squat (DB)|squat|Wide stance, toes out|Hits the inner thighs and glutes
Sissy Squat|squat|Heels up, knees forward, lean back|Bodyweight is plenty
Jump Squats|squat|Land soft and go straight into the next rep|Explosive, keep the reps crisp
Leg Extension|legext|Pad on your lower shin, knee lined up with the machine pivot|Squeeze at the top, lower slowly
Single-Leg Leg Extension|legext|One leg at a time|Pause at the top
Bulgarian Split Squat|lunge|Rear foot on the bench|Drop straight down, drive through the front heel
Walking Lunges|lunge|Long stride, torso tall|Back knee just above the floor
Reverse Lunge|lunge|Step back, easier on the knees|Push through the front heel
Forward Lunge|lunge|Step forward, push back up|Control the landing
Step-Ups|lunge|Knee-height box|Drive through the top leg only
Lateral Lunge|lunge|Big step to the side, sit into that hip|Other leg stays straight
Curtsy Lunge|lunge|Step behind and across|Side glute and quad
Split Squat (static)|lunge|Feet stay planted|Straight up and down
Smith Machine Lunge|lunge|Stable bar path|Good for going heavier`,
hamstrings: `Romanian Deadlift|hinge|Soft knees, push your hips back|Bar slides down your thighs, back flat
Dumbbell RDL|hinge|DBs close to your legs|Hips back, not down
Single-Leg RDL|hinge|DB in the opposite hand|Back leg in line with your torso
Stiff-Leg Deadlift|hinge|Knees nearly straight|Big hamstring stretch, go lighter
Conventional Deadlift|hinge|Bar over mid-foot, lats tight|Push the floor away, lock out with your glutes
Sumo Deadlift|hinge|Wide stance, hands inside your knees|More glutes and adductors
Trap Bar Deadlift|hinge|Stand in the center, neutral grip|Easier on the lower back
Good Morning|hinge|Bar on your upper back, soft knees|Hinge until your torso is near parallel
Cable Pull-Through|hinge|Face away from the low cable|Snap your hips forward
45° Back Extension|hinge|Hips on the pad edge|Round slightly for the hamstrings, flat back for the glutes
Reverse Hyper|hinge|Swing your legs up with your glutes|Control the way down
Lying Leg Curl|legcurl|Hips pressed into the pad|Curl fully, 2–3 sec down
Seated Leg Curl|legcurl|Thigh pad snug|Slow on the return
Standing Single-Leg Curl|legcurl|One leg at a time|Squeeze at the top
Nordic Curl|legcurl|Anchor your heels|Lower as slowly as you can
Stability Ball Leg Curl|legcurl|Hips up the whole time|Roll the ball in and out
Glute-Ham Raise|legcurl|Knees on the pad, feet locked|Curl yourself up with your hamstrings
Kettlebell Swing|swing|Hinge, snap your hips|Arms just guide the bell`,
glutes: `Barbell Hip Thrust|thrust|Upper back on the bench, pad on the bar|Chin tucked, squeeze 2 sec at the top
Smith Machine Hip Thrust|thrust|Steady bar path|Shins vertical at the top
Hip Thrust Machine|thrust|Belt across your hips|Pause at the top
Single-Leg Hip Thrust|thrust|Keep your hips level|Great for imbalances
B-Stance Hip Thrust|thrust|Working foot flat, other foot on its toes|Most of the load goes through one glute
Glute Bridge|thrust|Shoulders on the floor|Drive through your heels
Banded Glute Bridge|thrust|Band above your knees|Push your knees out
Frog Pumps|thrust|Soles of your feet together, knees out|Fast pumps, chase the burn
Cable Glute Kickback|kickback|Kick back and slightly out|Don't arch your lower back
Glute Kickback Machine|kickback|Chest on the pad|Push through your heel
Donkey Kicks|kickback|On all fours|Heel toward the ceiling
Banded Kickback|kickback|Band around your feet|Slow and controlled
Hip Abduction Machine|abduct|Lean slightly forward for more glute|Pause, then return slowly
Cable Hip Abduction|abduct|Ankle strap on the outside leg|Lift out to the side
Banded Lateral Walk|abduct|Band above your knees, quarter squat|Small steps, constant tension
Fire Hydrants|abduct|On all fours, lift your knee out to the side|Keep your hips square
Side-Lying Leg Raise|abduct|Top leg straight|Lead with your heel
High Box Step-Up|lunge|Box above knee height|Lean forward for more glute
Sumo Deadlift|hinge|Wide stance|Squeeze your glutes to lock out
Cable Pull-Through|hinge|Hips back, snap forward|Hard squeeze at the top
Curtsy Lunge|lunge|Step behind and across|Side glute focus
Kas Glute Bridge|thrust|Short range at the top only|Constant glute tension`,
chest: `Flat Barbell Bench Press|bench|Shoulder blades pinned back|Bar to your lower chest, elbows ~45°
Flat Dumbbell Bench Press|bench|Deep stretch at the bottom|Press up and slightly in
Incline Barbell Press|bench|Bench at 30°|Bar to just under your collarbone
Incline Dumbbell Press|bench|Bench at 30°|Lower to your upper chest
Decline Bench Press|bench|Lower chest focus|Control the bar
Close-Grip Bench Press|bench|Hands shoulder-width|Triceps and inner chest
Machine Chest Press|bench|Handles at mid-chest|Push close to failure safely
Incline Machine Press|bench|Upper chest|Slow negative
Smith Machine Bench|bench|Bar lines up with your lower chest|Stable for heavy sets
Incline Smith Press|bench|Bench at 30°|Upper chest
Hammer Strength Press|bench|One arm at a time works too|Full stretch
Cable Flyes|fly|Slight bend in the elbows, locked|Hug a tree
Low-to-High Cable Fly|fly|Cables at the bottom|Upper chest
High-to-Low Cable Fly|fly|Cables at the top|Lower chest
Pec Deck|fly|Handles at chest height|Slow on the way back
Dumbbell Flyes|fly|Soft elbows|Stop at a comfortable stretch
Chest Dips|dip|Lean forward|Shoulders just below your elbows
Push-Ups|plank|Body in one straight line|Chest to the floor
Deficit Push-Ups|plank|Hands on plates for extra range|Slow down
Incline Push-Ups|plank|Hands on a bench, easier|Good for high reps
Landmine Press|landmine|Press up and forward|Follow the arc
Svend Press|bench|Squeeze two plates together|Press straight out`,
shoulders: `Standing Overhead DB Press|ohp|Brace your abs, squeeze your glutes|Biceps by your ears at the top
Seated Dumbbell Press|ohp|Back on a near-upright bench|Lower to ear level
Barbell Overhead Press|ohp|Bar on your front delts|Move your head back, then push it through
Arnold Press|ohp|Start palms facing you|Rotate as you press
Machine Shoulder Press|ohp|Handles at shoulder height|Controlled reps
Seated Smith Press|ohp|Bar just in front of your face|Stable for heavy sets
Landmine Press|landmine|Shoulder-friendly angle|One arm at a time
DB Lateral Raise|latraise|Lead with your elbows|Stop at shoulder height
Cable Lateral Raise|latraise|Cable at the bottom, cross-body|Constant tension
Machine Lateral Raise|latraise|Pads on your outer arms|Pause at the top
Lean-Away Lateral Raise|latraise|Hold a pole, lean away|One arm at a time
Seated Lateral Raise|latraise|No swinging|Strict form
Front Raise|latraise|Raise in front to eye level|Light weight
Y-Raise|latraise|Lie chest-down on an incline, raise in a Y|Lower traps and delts
Upright Row (wide grip)|facepull|Pull to chest height, elbows lead|Wide grip is easier on the shoulders
Face Pulls|facepull|Rope to your eyes, elbows high|Rotate your hands back at the end
Reverse Pec Deck|fly|Lead with your elbows|Rear delts
Rear Delt DB Fly|row|Bent over, light DBs|Raise out to the sides
Band Pull-Apart|facepull|Arms straight|Pull the band to your chest`,
back: `Pull-Ups|pullup|Full dead hang|Drive your elbows down to your back pockets
Chin-Ups|pullup|Palms facing you|More biceps
Assisted Pull-Up|pullup|Use as little help as you can|Full range of motion
Lat Pulldown|pullup|Thighs locked in|Pull to your upper chest
Close-Grip Pulldown|pullup|V-handle|Elbows tight to your sides
Single-Arm Pulldown|pullup|Kneel, pull to your side|Big stretch at the top
Barbell Bent-Over Row|row|Hinge to ~45°|Pull to your belly button
Pendlay Row|row|Bar starts on the floor each rep|Explosive pull
Dumbbell Row|row|Hand and knee on the bench|Pull to your hip
Chest-Supported Row|row|Chest on an incline bench|No cheating
T-Bar Row|row|Chest up|Pull the handle to your stomach
Seal Row|row|Lie on a high bench|Strict back work
Meadows Row|row|Landmine, staggered stance|Elbow back and high
Inverted Row|row|Bar at waist height|Chest to the bar
Renegade Row|row|High plank on DBs|Don't twist your hips
Seated Cable Row|seatedrow|Sit tall|Squeeze your shoulder blades for 1 sec
Machine Row|seatedrow|Chest on the pad|Elbows straight back
Single-Arm Cable Row|seatedrow|Rotate slightly into the pull|Big stretch
Wide-Grip Cable Row|seatedrow|Elbows out|Upper back and rear delts
Straight-Arm Pulldown|straightarm|Arms locked|Sweep down with your lats
Rope Pullover|straightarm|Flare the rope at the bottom|Constant tension
Dumbbell Pullover|straightarm|Lie across a bench|Big stretch overhead
Rack Pull|hinge|Bar at knee height|Heavy upper-back and trap work
Face Pulls|facepull|Elbows high|Rear delts and posture`,
arms: `Barbell Curl|curl|Elbows pinned|No swinging
EZ-Bar Curl|curl|Easier on the wrists|Full range of motion
Dumbbell Curl|curl|Twist your palms up as you curl|Slow down
Hammer Curls|curl|Palms face each other|Forearms and brachialis
Incline DB Curl|curl|Arms hang behind you|Big stretch
Preacher Curl|curl|Armpit snug on the pad|Don't fully lock out
Cable Curl|curl|Constant tension|Squeeze at the top
Spider Curl|curl|Chest on an incline bench|Arms hang straight down
Concentration Curl|curl|Elbow on your inner thigh|Strict peak contraction
Rope Hammer Curl|curl|Low cable|Pull the rope apart at the top
Bicep Curls + Tricep Pushdowns|curl|Superset|Elbows pinned on both
Tricep Pushdown (rope)|curl|Spread the rope at the bottom|Elbows at your sides
Straight-Bar Pushdown|curl|Heavier option|Lock out fully
Overhead Cable Extension|curl|Hits the long head of the triceps|Big stretch
Overhead DB Extension|curl|One DB, both hands|Elbows pointed up
Skull Crushers|bench|Lower to just behind your head|Elbows stay in
Close-Grip Bench Press|bench|Hands shoulder-width|Heavy triceps work
Tricep Dips|dip|Body upright|Lock out at the top
Bench Dips|dip|Hands on the bench behind you|Bend your knees to make it easier
Cable Kickback (tricep)|curl|Hinge forward|Squeeze at full extension
Diamond Push-Ups|plank|Hands together under your chest|Triceps burner`,
calves: `Standing Calf Raise|calf|Full stretch at the bottom|1 sec hold at the top
Seated Calf Raise|calf|Hits the lower calf (soleus)|Slow and full range
Leg Press Calf Press|calf|Toes on the bottom edge|Don't lock your knees hard
Smith Machine Calf Raise|calf|Toes on a plate|Pause at the top
Single-Leg DB Calf Raise|calf|Hold something for balance|Slow
Donkey Calf Raise|calf|Bent over, hips loaded|Huge stretch
Tibialis Raise|calf|Lean on a wall, lift your toes|Bulletproofs the shins`,
core: `Hanging Leg Raises|legraise|No swinging|Curl your pelvis up
Hanging Knee Raise|legraise|Knees to your chest|Easier version
Captain's Chair Knee Raise|legraise|Back against the pad|Curl your hips
Lying Leg Raise|legraise|Lower back pressed down|Stop before it arches
Reverse Crunch|legraise|Roll your hips toward your chest|Lower slowly
Weighted Cable Crunch|crunch|Ribs toward your hips|Hips stay still
Decline Weighted Sit-Up|crunch|Plate on your chest|One vertebra at a time
Ab Crunch Machine|crunch|Heavy and controlled|Squeeze at the bottom
Ab Wheel Rollout|plank|Flat back|Pull back with your abs
Plank|plank|Squeeze your glutes, ribs down|Breathe
Side Plank|plank|Hips up|Straight line
Plank Shoulder Taps|plank|Hips still|Tap the opposite shoulder
Plank-to-Pushup Transitions|plank|Hips square|Alternate the lead arm
Mountain Climbers|plank|Drive your knees to your chest|Hips low
Bear Crawl Hold|plank|Knees an inch off the floor|Flat back
Dead Bug|deadbug|Lower back glued down|Opposite arm and leg
Bicycle Crunches|deadbug|Elbow to opposite knee|Slow
Hollow Body Hold|deadbug|Arms and legs long|Lower back flat
V-Ups|deadbug|Hands meet your feet|Control the way down
Toe Touches|deadbug|Legs up|Reach for your toes
Bird Dog|deadbug|On all fours, opposite arm and leg|Slow and steady
Russian Twists|twist|Rotate your shoulders|Feet anchored or up
Decline Russian Twist|twist|On a decline bench|Plate at your chest
Cable Woodchopper|twist|High to low across your body|Pivot your back foot
Pallof Press|twist|Press out, resist the rotation|Anti-rotation core
Landmine Rotation|twist|Arms straight|Rotate with your hips
Standing Oblique Crunch|twist|Elbow to knee|Alternate sides`,
cardio: `Incline Treadmill Walk|walk|Incline 10–12, 3.0–3.5 mph|Don't hold the rails
Treadmill Run|walk|Easy conversational pace|Or intervals: 1 min hard, 1 min easy
Stairmaster|walk|Upright posture|Light touch on the rails
Elliptical|walk|Moderate resistance|Push and pull the handles
Stationary Bike|walk|Steady pace or intervals|Seat at hip height
Rowing Machine|seatedrow|Legs, then hips, then arms|Smooth strokes
Outdoor Walk|walk|Brisk pace|Find a hill
High Knees|walk|Knees to hip height|Quick feet
Jumping Jacks|abduct|Light on your feet|Steady rhythm
Jump Rope|calf|Small bounces|Wrists do the work
Kettlebell Swings|swing|Hinge, snap your hips|Glutes and heart rate up
Dumbbell Swings|swing|Both hands on one DB|Same hip snap
Dumbbell Thrusters|thruster|Squat, then press overhead in one move|Keep the pace up
Burpees|thruster|Chest to the floor, jump at the top|Scale by stepping back instead
Sled Push|lunge|Low body angle|Drive your legs
Battle Ropes|curl|Alternating waves|Hips low`
};
const LIB = {}, LIB_ALL = [];
for (const cat in LIB_RAW) LIB[cat] = LIB_RAW[cat].split('\n').map(l => { const [n, pat, ...cues] = l.split('|').map(x => x.trim()); const o = { n, pat: P[pat] ? pat : 'squat', cues }; LIB_ALL.push(o); return o; });
const LIB_CAT_NAMES = { quads: 'Quads & legs', hamstrings: 'Hamstrings', glutes: 'Glutes', chest: 'Chest', shoulders: 'Shoulders', back: 'Back', arms: 'Arms', calves: 'Calves', core: 'Core & abs', cardio: 'Cardio & conditioning' };
const PAT_CATS = { squat: ['quads', 'glutes'], legpress: ['quads', 'glutes'], lunge: ['quads', 'glutes'], legext: ['quads'], hinge: ['hamstrings', 'glutes'], legcurl: ['hamstrings'], thrust: ['glutes', 'hamstrings'], kickback: ['glutes'], abduct: ['glutes'], calf: ['calves'], bench: ['chest', 'arms'], fly: ['chest', 'shoulders'], dip: ['chest', 'arms'], ohp: ['shoulders'], landmine: ['shoulders', 'chest'], latraise: ['shoulders'], facepull: ['shoulders', 'back'], row: ['back'], seatedrow: ['back'], pullup: ['back'], straightarm: ['back'], curl: ['arms'], legraise: ['core'], crunch: ['core'], twist: ['core'], plank: ['core'], deadbug: ['core'], walk: ['cardio'], swing: ['cardio', 'glutes'], thruster: ['cardio', 'quads'], pushup: ['chest', 'arms'], inclinepress: ['chest'], seatedpress: ['shoulders'], pulldown: ['back'], pushdown: ['arms'], ohext: ['arms'], skull: ['arms'], pullover: ['back', 'chest'], seatedfly: ['chest', 'shoulders'], bridge: ['glutes'], lyingraise: ['core'], situp: ['core'], sideplank: ['core'], rollout: ['core'], backext: ['hamstrings', 'glutes'], uprow: ['shoulders'], frontraise: ['shoulders'], jack: ['cardio'], jumprope: ['cardio'], bike: ['cardio'], rower: ['cardio'], burpee: ['cardio'], sled: ['cardio'], ropes: ['cardio'], latlunge: ['quads', 'glutes'], stepup: ['quads', 'glutes'] };
const libFind = n => LIB_ALL.find(o => o.n.toLowerCase() === String(n).toLowerCase()) || null;

/* ---- give every exercise its own best-matching figure ---- */
const FIG_RULES = [[/\+/, null], [/plank-to-push|plank jack|plank row|plank shoulder/i, null], [/side plank/i, 'sideplank'], [/push-?ups?/i, 'pushup'],
  [/incline.*(press|bench)/i, 'inclinepress'], [/seated.*press|machine shoulder press|arnold/i, 'seatedpress'], [/straight-arm/i, null], [/pulldown/i, 'pulldown'],
  [/pushdown|kickback \(tricep\)/i, 'pushdown'], [/overhead.*ext/i, 'ohext'], [/skull/i, 'skull'], [/pec deck/i, 'seatedfly'], [/kas /i, null],
  [/glute bridge|frog pump/i, 'bridge'], [/lying leg raise|reverse crunch|toe touches/i, 'lyingraise'], [/sit-up|v-ups/i, 'situp'], [/back extension|reverse hyper/i, 'backext'],
  [/upright row/i, 'uprow'], [/front raise/i, 'frontraise'], [/jumping jack/i, 'jack'], [/jump rope/i, 'jumprope'], [/bike/i, 'bike'], [/rowing machine/i, 'rower'],
  [/burpee/i, 'burpee'], [/sled/i, 'sled'], [/battle rope/i, 'ropes'], [/lateral lunge/i, 'latlunge'], [/step-up/i, 'stepup'], [/ab wheel/i, 'rollout'], [/dumbbell pullover/i, 'pullover']];
function figFor(n, pat) { for (const [re, p] of FIG_RULES) if (re.test(n)) return p || pat; return pat; }
for (const o of LIB_ALL) o.pat = figFor(o.n, o.pat);
for (const days of [DAYS_KING, DAYS_QXEEN]) for (const d of days) for (const sl of d.slots) for (const o of sl.opts) o.pat = figFor(o.n, o.pat);

/* Qxeen's routine: fat loss + toning, glute focused. Extra movement patterns used by her exercises. */
Object.assign(P, {
 kickback:{A:{h:[76,28],s:[68,38],e:[80,46],w:[90,50],p:[56,62],k:[58,84],f:[54,106],k2:[58,86],f2:[58,110]},B:{k:[40,74],f:[20,84]},props:['floor','cable:f:2:108'],tempo:[1,1,2],ph:['Kick back','Squeeze','Return slow']},
 abduct:{A:{h:[60,18],s:[60,30],e:[50,44],w:[46,58],e2:[70,44],w2:[74,58],p:[60,62],k:[63,86],f:[64,110],k2:[56,86],f2:[56,110]},B:{k:[74,84],f:[88,104]},props:['floor'],tempo:[1,1,2],ph:['Push out','Squeeze','Return slow']},
 swing:{A:{h:[88,46],s:[78,52],e:[72,68],w:[66,84],p:[50,62],k:[57,84],f:[55,110]},B:{h:[60,18],s:[60,30],e:[76,32],w:[92,32],p:[60,62],k:[61,86],f:[60,110]},props:['floor','plate:w'],tempo:[.7,.2,.8],ph:['Snap hips','Float','Hike back']},
 latraise:{A:{h:[60,18],s:[60,30],e:[52,46],w:[50,60],e2:[68,46],w2:[70,60],p:[60,62],k:[57,86],f:[56,110],k2:[63,86],f2:[64,110]},B:{e:[44,32],w:[30,33],e2:[76,32],w2:[90,33]},props:['floor','db:w','db:w2'],tempo:[1,1,2],ph:['Raise','Hold','Lower slow']},
 walk:{A:{h:[62,18],s:[61,30],e:[54,46],w:[58,60],e2:[68,46],w2:[74,56],p:[60,62],k:[68,84],f:[72,108],k2:[54,86],f2:[46,108]},B:{e:[68,46],w:[74,56],e2:[54,46],w2:[58,60],k:[54,86],f:[46,108],k2:[68,84],f2:[72,108]},props:['incline'],tempo:[.6,0,.6],ph:['Step','','Step']},
 deadbug:{A:{h:[16,90],s:[30,94],e:[30,78],w:[30,62],e2:[34,78],w2:[34,62],p:[66,94],k:[66,74],f:[84,74],k2:[70,74],f2:[88,74]},B:{e:[18,84],w:[4,88],k:[86,90],f:[108,94]},props:['floor'],tempo:[2,1,2],ph:['Extend','Hold','Return']},
 thruster:{A:{h:[74,46],s:[67,57],e:[58,64],w:[64,52],p:[42,80],k:[70,84],f:[60,110]},B:{h:[60,18],s:[60,30],e:[60,12],w:[62,-4],p:[60,62],k:[61,86]},props:['floor','db:w'],tempo:[1,0,2],ph:['Drive & press','','Lower to squat']}
});

const DAYS_QXEEN=[
{d:'Mon',title:'Glutes & Hams',slots:[
 {sets:4,reps:'10–12',rest:90,opts:[
  X('Barbell Hip Thrust','thrust',['Upper back on the bench edge, pad on the bar','Chin tucked, ribs down, push through your heels','Squeeze your glutes hard for 2 sec at the top']),
  X('Smith Machine Hip Thrust','thrust',['Same setup with a steadier bar path','Shins vertical at the top']),
  X('Glute Bridge (weighted)','thrust',['On the floor, DB or plate on your hips','Squeeze 2 sec at the top']),
  X('Single-Leg Hip Thrust','thrust',['Bodyweight or a DB on the working hip','Keep your hips level'])]},
 {sets:3,reps:'10–12',rest:75,opts:[
  X('Dumbbell Romanian Deadlift','hinge',['Soft knees, push your hips back to the wall behind you','DBs slide down close to your legs','Feel the hamstring stretch, then squeeze your glutes to stand']),
  X('Barbell RDL','hinge',['Bar close, back flat','Stop at mid-shin or when the stretch peaks']),
  X('Single-Leg RDL','hinge',['Hold a DB in the opposite hand','Back leg in line with your torso','Great for balance and glute activation']),
  X('Cable Pull-Through','hinge',['Face away from the low cable','Hips back, then snap forward and squeeze'])]},
 {sets:3,reps:'10 per leg',rest:75,opts:[
  X('Bulgarian Split Squat','lunge',['Rear foot on the bench','Lean slightly forward to bias the glutes','Drive up through your front heel']),
  X('Reverse Lunge','lunge',['Step back, drop the back knee down','Push through the front heel']),
  X('Curtsy Lunge','lunge',['Step back and across behind you','Hits the side glute (glute medius)']),
  X('Step-Ups','lunge',['Knee-height box','Drive through the top leg, don\'t push off the back foot'])]},
 {sets:3,reps:'12–15 per leg',rest:45,opts:[
  X('Cable Glute Kickback','kickback',['Ankle strap, hold the machine, slight forward lean','Kick back and slightly out, squeeze at the top','Don\'t arch your lower back. The movement comes from the glute']),
  X('Glute Kickback Machine','kickback',['Chest on the pad','Push through your heel']),
  X('Donkey Kicks (ankle weight)','kickback',['On hands and knees','Kick your heel up toward the ceiling']),
  X('Banded Kickback','kickback',['Band around both ankles or feet','Slow and controlled'])]},
 {sets:3,reps:'15–20',rest:45,opts:[
  X('Hip Abduction Machine','abduct',['Lean slightly forward to hit more glute','Push out, pause, return slowly','Don\'t let the weights slam']),
  X('Banded Lateral Walk','abduct',['Band above the knees, quarter squat','Small steps, keep the tension the whole time']),
  X('Cable Hip Abduction','abduct',['Ankle strap on the outside leg','Lift out to the side, no leaning']),
  X('Side-Lying Leg Raise','abduct',['Lie on your side, top leg straight','Lift with your heel leading'])]},
 {sets:2,reps:'25',rest:45,opts:[
  X('Frog Pumps (finisher)','thrust',['On your back, soles of your feet together, knees out','Fast pumps, squeeze at every rep','Burnout: chase the burn']),
  X('Glute Bridge Pulses','thrust',['Hold at the top, small pulses']),
  X('Banded Glute Bridge','thrust',['Band above the knees, push the knees out'])]}
]},
{d:'Tue',title:'Upper & Core',slots:[
 {sets:3,reps:'10–12',rest:60,opts:[
  X('Lat Pulldown','pullup',['Wide grip, lean back slightly','Pull to your upper chest, elbows down and back','Control on the way up']),
  X('Assisted Pull-Up','pullup',['Use the least help you can','Full range of motion']),
  X('Single-Arm Cable Pulldown','pullup',['Kneel, pull to the side of your chest']),
  X('Band Pulldown','pullup',['Band anchored high','Squeeze your shoulder blades down'])]},
 {sets:3,reps:'10–12',rest:60,opts:[
  X('Seated DB Shoulder Press','ohp',['Back flat against the bench','Press up, don\'t clank the DBs together','Lower to ear level']),
  X('Arnold Press','ohp',['Start palms facing you, rotate as you press']),
  X('Machine Shoulder Press','ohp',['Seat height: handles at shoulder level']),
  X('Standing DB Press','ohp',['Squeeze your glutes and abs, no leaning back'])]},
 {sets:3,reps:'12',rest:60,opts:[
  X('Seated Cable Row','seatedrow',['Sit tall, pull to your belly button','Squeeze your shoulder blades for 1 sec']),
  X('Single-Arm DB Row','row',['Hand and knee on the bench','Pull to the hip']),
  X('Machine Row','seatedrow',['Chest on the pad','Elbows straight back']),
  X('Band Row','seatedrow',['Band around something sturdy','Slow return'])]},
 {sets:3,reps:'12–15',rest:45,opts:[
  X('DB Lateral Raise','latraise',['Slight bend in the elbows','Lead with your elbows to shoulder height, not higher','Light weight, slow lower. This gives the toned shoulder look']),
  X('Cable Lateral Raise','latraise',['Cable at the bottom, cross-body','Constant tension']),
  X('Seated Lateral Raise','latraise',['Removes swinging and cheating']),
  X('Lean-Away Lateral Raise','latraise',['Hold a pole, lean away, one arm at a time'])]},
 {sets:3,reps:'12–15',rest:45,opts:[
  X('Tricep Pushdown + Bicep Curl','curl',['SUPERSET: pushdowns, then straight into curls','Elbows pinned at your sides','Targets the back of the arms']),
  X('Overhead Tricep Ext + Hammer Curl','curl',['Superset','The overhead extension hits the back of the arm the most']),
  X('Bench Dips + DB Curl','dip',['Superset','Hands on the bench behind you, bend knees to make it easier']),
  X('Cable Kickback (tricep) + Cable Curl','curl',['Superset','Squeeze at full extension'])]},
 {sets:3,reps:'40 sec',time:40,rest:45,opts:[
  X('Plank','plank',['Forearms under your shoulders','Squeeze your glutes, ribs down, flat back','Breathe! Don\'t hold your breath']),
  X('Side Plank (20s each side)','plank',['Hips up, straight line','Switch sides halfway']),
  X('Plank Shoulder Taps','plank',['High plank, tap the opposite shoulder','Keep your hips still']),
  X('Dead Bug Hold','deadbug',['Lower back glued to the floor'])]}
]},
{d:'Wed',title:'Cardio & Core',slots:[
 {sets:1,reps:'20 min',time:1200,rest:60,opts:[
  X('Incline Treadmill Walk','walk',['Incline 10–12, speed 3.0–3.5 mph','Don\'t hold the rails, pump your arms','Fat-burning zone: you can talk but not sing']),
  X('Stairmaster','walk',['Steady pace, upright posture','Light touch on the rails only']),
  X('Elliptical','walk',['Resistance moderate, push and pull the handles']),
  X('Outdoor Brisk Walk / Hill Walk','walk',['Find a hill if you can','Brisk pace'])]},
 {sets:4,reps:'15',rest:45,opts:[
  X('Kettlebell Swings','swing',['Hinge, don\'t squat. Hike the bell back between your legs','Snap your hips forward, the bell floats to chest height','Glutes and heart rate both go up']),
  X('Dumbbell Swings','swing',['Hold one DB by the end with both hands']),
  X('Cable Pull-Through','hinge',['Same hip snap, no impact']),
  X('Glute Bridge (fast tempo)','thrust',['Quick reps, squeeze at the top'])]},
 {sets:3,reps:'30 sec',time:30,rest:30,opts:[
  X('Mountain Climbers','plank',['High plank, drive your knees to your chest','Fast but controlled, hips low']),
  X('Plank Jacks','plank',['Jump your feet in and out']),
  X('High Knees','walk',['Knees to hip height, quick feet']),
  X('Slow Mountain Climbers','plank',['Low impact: step instead of run'])]},
 {sets:3,reps:'10 per side',rest:45,opts:[
  X('Dead Bug','deadbug',['Lower back pressed into the floor','Opposite arm and leg extend slowly','Exhale as you extend']),
  X('Bicycle Crunches','deadbug',['Elbow to opposite knee, slow','Fully extend the other leg']),
  X('Reverse Crunch','legraise',['Roll your hips up toward your chest','Lower slowly']),
  X('Hollow Body Hold','deadbug',['Arms and legs extended, low back flat'])]},
 {sets:3,reps:'20 total',rest:45,opts:[
  X('Russian Twists','twist',['Lean back, chest up','Rotate your shoulders, not just your arms','Hold a light DB or plate']),
  X('Cable Woodchopper','twist',['High to low across your body']),
  X('Seated Twist (feet up)','twist',['Harder: feet off the floor']),
  X('Standing Oblique Crunch','twist',['Elbow to knee, alternate sides'])]}
]},
{d:'Thu',title:'Legs & Glutes',slots:[
 {sets:4,reps:'12',rest:75,opts:[
  X('Goblet Squat','squat',['DB held at your chest, elbows in','Sit down between your hips, chest up','Push your knees out and squeeze your glutes to stand']),
  X('Sumo DB Squat','squat',['Wide stance, toes out','Hits the inner thighs and glutes']),
  X('Smith Machine Squat','squat',['Feet slightly forward','Full depth']),
  X('Box Squat','squat',['Sit back to a box, stand up tall'])]},
 {sets:3,reps:'12–15',rest:75,opts:[
  X('Leg Press (feet high & wide)','legpress',['Feet high and wide on the platform puts the focus on the glutes','Lower until your knees are about 90°','Press through your heels']),
  X('Hack Squat','squat',['Feet high on the platform for glutes']),
  X('Single-Leg Leg Press','legpress',['One foot centered, slow']),
  X('Smith Sumo Squat','squat',['Wide stance, toes out'])]},
 {sets:3,reps:'12 per leg',rest:60,opts:[
  X('Walking Lunges','lunge',['Long stride for glutes','Torso tall, slight forward lean','Push through the front heel']),
  X('Reverse Lunge','lunge',['Easier on the knees']),
  X('Curtsy Lunge','lunge',['Step behind and across','Side glute focus']),
  X('Step-Ups','lunge',['Drive through the top heel'])]},
 {sets:3,reps:'12–15',rest:45,opts:[
  X('Lying Leg Curl','legcurl',['Hips pressed into the pad','Curl fully, lower slowly']),
  X('Seated Leg Curl','legcurl',['Back flat, slow on the way back']),
  X('Stability Ball Leg Curl','legcurl',['Hips up, roll the ball in and out']),
  X('Single-Leg Curl','legcurl',['One leg at a time'])]},
 {sets:3,reps:'15',rest:45,opts:[
  X('Banded Glute Bridge','thrust',['Band above the knees, push them out','2 sec squeeze at the top']),
  X('Hip Thrust (light, slow)','thrust',['Focus on the squeeze, not the weight']),
  X('Single-Leg Glute Bridge','thrust',['Hips level']),
  X('Frog Pumps','thrust',['Fast pumps, squeeze every rep'])]},
 {sets:3,reps:'15–20',rest:30,opts:[
  X('Standing Calf Raise','calf',['Full stretch, pause at the top']),
  X('Seated Calf Raise','calf',['Slow and full range']),
  X('Single-Leg Calf Raise','calf',['Hold something for balance']),
  X('Leg Press Calf Press','calf',['Toes on the edge of the platform'])]}
]},
{d:'Fri',title:'Full Body Burn',slots:[
 {sets:3,reps:'12',rest:60,opts:[
  X('Dumbbell Thrusters','thruster',['DBs at your shoulders, squeeze down','Drive up and press overhead in one smooth move','Full-body fat burner, so keep the pace up']),
  X('Goblet Squat to Press','thruster',['One DB at your chest, squeeze, stand and press']),
  X('Squat + Shoulder Press','thruster',['Do the squat, then the press, as separate moves']),
  X('Wall Ball','thruster',['Squat, throw the ball to the target, catch it'])]},
 {sets:3,reps:'10 per side',rest:60,opts:[
  X('Renegade Row','row',['High plank on DBs, feet wide','Row one side, don\'t twist your hips','Core and back in one move']),
  X('Single-Arm DB Row','row',['Hand and knee on the bench']),
  X('Plank Row (knees down)','row',['Easier version on the knees']),
  X('Cable Row','seatedrow',['Steady tempo'])]},
 {sets:3,reps:'10 per leg',rest:45,opts:[
  X('Reverse Lunge to Knee Drive','lunge',['Step back, lunge, drive the back knee up as you stand','Add a hop for more burn']),
  X('Reverse Lunge','lunge',['Hold DBs to make it harder']),
  X('Step-Up to Knee Drive','lunge',['Drive the knee up at the top']),
  X('Curtsy Lunge','lunge',['Alternate sides'])]},
 {sets:3,reps:'15',rest:45,opts:[
  X('Kettlebell Swings','swing',['Hips snap, arms just guide','Heart rate up, glutes on fire']),
  X('Dumbbell Swings','swing',['Both hands on one DB']),
  X('Jump Squats','squat',['Land soft, straight into the next rep']),
  X('Glute Bridge (fast)','thrust',['Quick tempo'])]},
 {sets:3,reps:'15 per leg',rest:30,opts:[
  X('Cable Glute Kickback','kickback',['Squeeze at the top, slow return']),
  X('Donkey Kicks','kickback',['On all fours']),
  X('Banded Kickback','kickback',['Band around the feet']),
  X('Hip Abduction Machine','abduct',['Lean forward a little'])]},
 {sets:1,reps:'10 min',time:600,rest:60,opts:[
  X('Incline Walk (finisher)','walk',['Incline 10–12, steady pace','Cool down and burn a little extra']),
  X('Stairmaster','walk',['Steady pace']),
  X('Bike (easy pace)','walk',['Easy spin to cool down']),
  X('Outdoor Walk','walk',['Brisk pace'])]}
]}
];

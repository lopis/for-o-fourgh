with(new AudioContext)
with(G=createGain())
for(i in D=[,25,13,25,,25,,13,10,13,,25,,25,13,8,13,,,25,,13,7,13,,25,,25,13,8,13,25,,25,,13,10,13,,25,,25,13,11,13,11,,13,,13,,11,,13])
with(createOscillator())
if(D[i])
connect(G),
G.connect(destination),
start(i*.1),
frequency.setValueAtTime(220*1.06**(13-D[i]),i*.1),
gain.setValueAtTime(1,i*.1),
gain.setTargetAtTime(.0001,i*.1+.08,.005),
stop(i*.1+.09)

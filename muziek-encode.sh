#!/bin/bash
# Muziek-subpagina: final tracks -> m4a + duur-meter
set -e
FF=~/.hermes/tools/ffmpeg-9.0.1-linux-x64/bin
D=~/robaslab/media/muziek
NS=~/muziek-studio/nummers
mkdir -p "$D"
declare -A T=(
 [judokid]="$NS/../projecten/vive9-album/klaar/07-judokid-anthem-nl.mp3"
 [dojo-dromen]="$NS/../projecten/vive9-album/klaar/08-dojo-dreams-nl.mp3"
 [super-vive]="$NS/../projecten/vive9-album/klaar/09-super-vive-nl.mp3"
 [fabriek]="$NS/../projecten/vive9-album/klaar-ace/06-fabriek.mp3"
 [negen-kaarsen]="$NS/../projecten/vive9-album/klaar-ace/01-negen-kaarsen.mp3"
 [not-old-vintage]="$HOME/muziek-studio/albums/Mies 42 — Verjaardagskrakers/01 - Not Old Just Vintage (Mees 42).mp3"
 [true-diamond]="$HOME/muziek-studio/albums/Laurianne 33 — Verjaardagskrakers/01 - True Diamond (Laurianne 33).mp3"
 [halve-eeuw]="$NS/20261016-181538-ovjv50-01-halve-eeuw-op-/takes/take-02.mp3"
 [gouden-jubileum]="$NS/20261016-181538-ovjv50-03-gouden-jubileu/takes/take-02.mp3"
 [zoo-get-busy]="$NS/20261004-082504-sean-paul-get-busy/takes/take-03.mp3"
 [games-groove]="$NS/20261110-194058-t2-games-groove/takes/t2-games.mp3"
 [epic-finale]="$NS/20261110-194058-t4-epic-finale/takes/t4-finale.mp3"
)
> "$D/duur.txt"
for k in "${!T[@]}"; do
  src="${T[$k]}"
  if [ ! -f "$src" ]; then echo "MISSING $k :: $src"; continue; fi
  $FF/ffmpeg -y -v error -i "$src" -vn -map 0:a:0 -c:a aac -b:a 160k -movflags +faststart "$D/$k.m4a"
  dur=$($FF/ffprobe -v error -show_entries format=duration -of csv=p=0 "$src" | cut -d. -f1)
  echo "$k $dur" >> "$D/duur.txt"
  echo "OK $k (${dur}s)"
done
echo MUZIEK-ENCODER-KLAAR

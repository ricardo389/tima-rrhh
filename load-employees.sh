#!/bin/bash
# Load Cluky's Marif employees into Google Sheets via Web App API
# Run this AFTER deploying Code.gs to the Apps Script project

API="https://script.google.com/macros/s/AKfycbzCSIh8x7-PawUDfEMj2jIE9l80yHKyrrbbrl1YmMq56-Cauy9WegXIJCoq0YP8FzkF/exec"
LOCAL="Cluky's Marif"

add_emp() {
  local nom="$1" poste="$2"
  echo -n "Adding $nom... "
  curl -s -L -X POST "$API" \
    -H "Content-Type: text/plain" \
    -d "{\"action\":\"addEmploye\",\"nom\":\"$nom\",\"local\":\"$LOCAL\",\"poste\":\"$poste\",\"dateEntree\":\"2025-01-01\"}"
  echo ""
  sleep 1
}

add_emp "Smail Naceh" "Gerant Matin"
add_emp "Soufiane Bardaoui" "Gerant Soir"
add_emp "Imane Najim" "Polyvalent Salle"
add_emp "Asmaa Buda" "Polyvalent Salle"
add_emp "Yahya Diyab" "Polyvalent Cuisine"
add_emp "Ismail Aasli" "Polyvalent Cuisine"
add_emp "Reda Filali" "Polyvalent Cuisine"
add_emp "Nouhaila Moufrij" "Polyvalent Cuisine"
add_emp "Hatime Alhawari" "Polyvalent Cuisine"
add_emp "Marwane Ghailan" "Polyvalent Cuisine"
add_emp "Zakariya Abd Sadek" "Polyvalent Cuisine"
add_emp "Yahya Elghazi" "Polyvalent Cuisine"
add_emp "Said Bizgaren" "Polyvalent Cuisine"
add_emp "Sami Chabbouk" "Polyvalent Cuisine"
add_emp "Amine" "Polyvalent Cuisine"
add_emp "Saad Hamoussa" "Polyvalent Salle"
add_emp "Marwane Sabri" "Polyvalent Salle"
add_emp "Yasser Assal" "Polyvalent Salle"
add_emp "Khalid" "Polyvalent Salle"
add_emp "Akrame Kendi" "Polyvalent Salle"
add_emp "Mohamed" "Polyvalent Salle"
add_emp "Yassine Benlmalem" "Polyvalent Salle"
add_emp "Yahya Bribri" "Polyvalent Salle"
add_emp "Aymane Daifi" "Polyvalent Salle"
add_emp "Kaltoum Atouzar" "Plonge"
add_emp "Oussama Fahir" "Plonge"
add_emp "Nizar" "Operateur Laboratoire"
add_emp "Jamal" "Operateur Laboratoire"
add_emp "Chouaibe Tawdi" "Operateur Laboratoire"
add_emp "Mohammed" "Operateur Laboratoire"

echo ""
echo "Done! 30 employees loaded."

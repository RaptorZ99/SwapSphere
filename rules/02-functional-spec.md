# Functional Spec (MVP)

## Roles
- `User`: peut consulter ses objets, proposer un echange, repondre a une transaction.
- `Admin` (hors interface MVP): alimente les objets et assigne les proprietaires en base.

## User Stories et criteres d'acceptation

### US-01 Identification simplifiee
En tant qu'utilisateur, je selectionne mon profil dans une liste predefinie pour acceder a l'app.
- Critere 1: la liste des utilisateurs est fournie par l'API.
- Critere 2: la selection cree une session applicative simple.
- Critere 3: aucune inscription/mot de passe n'est expose.

### US-02 Consultation des objets
En tant qu'utilisateur, je vois mes objets et ceux d'un autre utilisateur.
- Critere 1: chaque fiche affiche titre, description, categorie, image, proprietaire.
- Critere 2: filtrage minimal par categorie.

### US-03 Proposition d'echange
En tant qu'utilisateur, je propose un echange avec un ou plusieurs objets de chaque cote et un message.
- Critere 1: au moins 1 objet du proposant.
- Critere 2: au moins 1 objet du destinataire.
- Critere 3: message initial obligatoire.

### US-04 Reponse du destinataire
En tant que destinataire, je peux accepter, refuser, ou repondre avec commentaire.
- Critere 1: action `ACCEPT` cloture la transaction en succes.
- Critere 2: action `REJECT` cloture la transaction en refus.
- Critere 3: action `COMMENT` conserve la transaction ouverte en negotiation.

### US-05 Historique de transaction
En tant qu'utilisateur implique dans une transaction, je vois l'historique complet des messages.
- Critere 1: messages ordonnes par date croissante.
- Critere 2: auteur et horodatage visibles.
- Critere 3: historique non editable dans le MVP.

# EduConnect Tunisia - Project TODO

## Phase 1: Foundation & Core Architecture

### Database Schema & Models
- [x] Créer tables pour 4 rôles utilisateurs (Student, Mentor, Parent, SchoolAdmin)
- [x] Créer table Wallet avec système EduCoin (1 TND = 10 Coins)
- [x] Créer table Transactions pour historique et prévention double-dépense
- [x] Créer table TutoringRequest pour matching Uber-style
- [x] Créer table TutoringSession pour gestion des sessions actives
- [x] Créer table ProgressNote pour portail parent-enseignant
- [x] Créer table SocialFeedPost pour feed social académique
- [x] Créer table Notification pour système de notifications
- [x] Créer relations entre tables (Student-Parent, Teacher-Student, etc.)

### Authentication & User Profiles
- [x] Implémenter système d'authentification multi-rôles
- [x] Créer page de sélection de rôle lors de l'inscription
- [x] Créer profils personnalisés pour chaque rôle
- [x] Ajouter champs spécifiques (spécialités pour mentors, classe pour étudiants, etc.)
- [x] Implémenter gestion des rôles avec protectedProcedure

## Phase 2: Matching System (Uber-Style)

### Student Side
- [x] Créer composant "Request Tutor" avec sélection de matière
- [x] Implémenter recherche mentors disponibles par matière
- [x] Créer interface pour voir mentors disponibles
- [x] Implémenter logique de création TutoringRequest
- [ ] Créer page de suivi des sessions actives (Student Dashboard)

### Mentor Side
- [x] Créer "Waiting Room" dashboard pour mentors
- [x] Implémenter notifications popup quand étudiant demande aide
- [x] Créer boutons Accept/Decline avec logique backend
- [x] Implémenter création Session ID et déduction EduCoins
- [x] Créer interface gestion sessions en cours

### Real-time Updates
- [ ] Implémenter WebSocket ou polling pour updates temps réel
- [ ] Synchroniser état des requêtes entre student/mentor
- [ ] Gérer timeout des requêtes non acceptées

## Phase 3: Wallet & Currency System

### Wallet Infrastructure
- [x] Créer composant Wallet pour tous les rôles
- [x] Implémenter logique conversion TND ↔ EduCoins (1 TND = 10)
- [x] Créer table Transactions avec audit trail complet
- [x] Implémenter prévention double-dépense avec transactions DB

### Student Wallet
- [x] Créer bouton "Top Up" avec interface Stripe
- [x] Implémenter intégration Stripe pour recharge
- [x] Afficher solde EduCoins en temps réel
- [x] Créer historique transactions étudiant

### Mentor Wallet
- [x] Créer onglet "Earnings" avec total coins gagnés
- [x] Implémenter bouton "Withdraw to TND"
- [x] Créer interface Stripe pour retrait en TND
- [x] Afficher historique gains et retraits

### Transaction Security
- [x] Implémenter idempotence pour éviter double-dépense
- [x] Créer audit trail complet des transactions
- [x] Ajouter validations montants et conversions
- [x] Implémenter rollback transactions en cas d'erreur

## Phase 4: Parent-Teacher Communication

### Teacher Dashboard
- [ ] Créer liste des étudiants du professeur
- [ ] Implémenter formulaire "Daily Remarks" avec textarea
- [ ] Ajouter toggle "Visible to Parent"
- [ ] Créer interface pour voir notes précédentes
- [ ] Implémenter timestamp et historique des notes

### Parent View
- [ ] Créer page pour voir notes liées à leurs enfants
- [ ] Implémenter filtrage par étudiant/date/matière
- [ ] Créer UI card-based pour afficher progression
- [ ] Implémenter notifications quand nouvelle note ajoutée

## Phase 5: Social Feed

### Feed Infrastructure
- [ ] Créer table SocialFeedPost avec contenu et metadata
- [ ] Implémenter système de likes/comments
- [ ] Créer permissions (public/private/class-only)

### Feed UI
- [ ] Créer composant Feed style LinkedIn
- [ ] Implémenter post creation pour réalisations académiques
- [ ] Créer système de filtrage (all/followed/class)
- [ ] Ajouter likes, comments, et partages

## Phase 6: Notifications System

### In-App Notifications
- [ ] Créer système notifications in-app
- [ ] Implémenter notifications pour tutor requests
- [ ] Ajouter notifications pour acceptation/refus sessions
- [ ] Créer notifications pour notes parent-teacher

### Push Notifications (Optional Phase 2)
- [ ] Implémenter Web Push API
- [ ] Créer service worker pour notifications
- [ ] Ajouter opt-in/opt-out pour utilisateurs

## Phase 7: Mobile Optimization

### Performance
- [ ] Optimiser bundle size pour connexions lentes
- [ ] Implémenter lazy loading des images
- [ ] Créer version mobile-first responsive
- [ ] Tester sur appareils mid-range

### Data Efficiency
- [ ] Implémenter pagination pour listes longues
- [ ] Compresser assets (images, CSS, JS)
- [ ] Ajouter service worker pour offline mode
- [ ] Optimiser requêtes API (batch queries)

## Phase 8: Internationalization

### Multi-language Support
- [ ] Créer système i18n (Français/Anglais/Arabe)
- [ ] Ajouter traductions pour tous les labels UI
- [ ] Implémenter sélecteur de langue
- [ ] Supporter RTL pour Arabe

## Phase 9: Stripe Integration

### Payment Processing
- [ ] Configurer Stripe API keys
- [ ] Implémenter checkout pour recharge EduCoins
- [ ] Créer webhook Stripe pour confirmations
- [ ] Implémenter retrait mentors vers TND

### Payment UI
- [ ] Créer formulaire recharge étudiant
- [ ] Créer formulaire retrait mentor
- [ ] Ajouter historique paiements
- [ ] Implémenter gestion erreurs paiement

## Phase 10: AI Chatbot (Optional Phase 2)

### Chatbot Infrastructure
- [ ] Intégrer LLM (OpenAI/Claude)
- [ ] Créer système prompts pour questions académiques
- [ ] Implémenter suggestion ressources d'apprentissage

### Chatbot UI
- [ ] Créer interface chat avant demande tuteur
- [ ] Implémenter suggestions intelligentes
- [ ] Ajouter historique conversations

## Phase 11: Testing & Quality

### Unit Tests
- [ ] Écrire tests pour logique wallet/transactions
- [ ] Tester matching algorithm
- [ ] Tester conversion TND/EduCoins
- [ ] Tester auth multi-rôles

### Integration Tests
- [ ] Tester flow complet tutor request
- [ ] Tester paiement Stripe
- [ ] Tester notifications
- [ ] Tester parent-teacher communication

## Phase 12: Deployment & Documentation

### Documentation
- [ ] Créer README avec architecture
- [ ] Documenter API endpoints
- [ ] Créer guide utilisateur par rôle
- [ ] Documenter système conversion TND/EduCoins

### Deployment
- [ ] Configurer variables environnement
- [ ] Tester sur environnement production
- [ ] Créer script migration données
- [ ] Documenter processus déploiement

---

## Notes Importantes

- **Optimisation Tunisie** : Interface légère, pagination, lazy loading, compression assets
- **Sécurité Transactions** : Idempotence, audit trail, rollback en cas d'erreur
- **Conversion TND** : 1 TND = 10 EduCoins (appliquer partout)
- **Temps Réel** : WebSocket pour notifications et matching
- **Multi-rôles** : 4 rôles distincts avec permissions différentes



## Phase 13: Landing Page & Navigation

### Homepage
- [x] Créer page d'accueil avec présentation EduConnect
- [x] Ajouter navigation vers /auth, /request-tutor, /mentor-dashboard, /wallet
- [x] Créer hero section avec CTA "Commencer"
- [x] Ajouter section "Comment ça marche" avec 4 rôles
- [ ] Ajouter testimonials d'étudiants/mentors

### Navigation
- [x] Créer composant Header avec logo et menu
- [x] Ajouter bouton profil/logout dans header
- [x] Créer composant Footer avec liens utiles
- [x] Implémenter navigation persistante entre pages

## Phase 14: Student Sessions Page

- [x] Créer page /sessions pour voir sessions actives
- [x] Afficher historique des demandes (open, accepted, completed)
- [x] Montrer détails session (mentor, sujet, durée, coût)
- [x] Ajouter bouton pour évaluer mentor (rating)
- [ ] Afficher statut paiement pour chaque session

## Phase 15: Parent-Teacher Portal

- [ ] Créer page /teacher-dashboard pour enseignants
- [ ] Lister étudiants de l'enseignant
- [ ] Implémenter formulaire "Daily Remarks" avec toggle visibilité
- [ ] Créer page /parent-portal pour parents
- [ ] Afficher notes visibles pour enfants
- [ ] Ajouter historique notes par date/matière

## Phase 16: Social Feed

- [ ] Créer page /feed pour feed social
- [ ] Implémenter création de posts (achievements, milestones)
- [ ] Ajouter système de likes et commentaires
- [ ] Afficher posts avec pagination
- [ ] Ajouter filtres (all, followed, class-only)

## Phase 17: Real-time Features

- [ ] Implémenter WebSocket pour notifications temps réel
- [ ] Ajouter polling fallback pour navigateurs sans WebSocket
- [ ] Créer système notifications in-app
- [ ] Ajouter Web Push API pour notifications browser
- [ ] Implémenter opt-in/opt-out notifications

## Phase 18: Mobile Optimization

- [ ] Tester sur appareils mid-range (iPhone 6, Samsung A10)
- [ ] Optimiser images avec lazy loading
- [ ] Réduire bundle size (minification, tree-shaking)
- [ ] Implémenter service worker pour offline mode
- [ ] Ajouter compression gzip pour assets

## Phase 19: Internationalization

- [ ] Configurer système i18n (Français/Anglais/Arabe)
- [ ] Traduire tous les labels UI
- [ ] Ajouter sélecteur de langue dans settings
- [ ] Supporter RTL pour Arabe
- [ ] Tester sur tous les langages

## Phase 20: Testing & QA

- [ ] Écrire tests unitaires pour db.ts
- [ ] Écrire tests pour routers tRPC
- [ ] Tester flow complet: auth → request → accept → payment
- [ ] Tester conversion TND/EduCoins
- [ ] Tester prévention double-dépense
- [ ] Tester permissions par rôle

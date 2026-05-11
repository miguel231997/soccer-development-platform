package com.soccerdev.security;

import com.soccerdev.club.Club;
import com.soccerdev.evaluation.PlayerMatchEvaluation;
import com.soccerdev.evaluation.PlayerMatchEvaluationRepository;
import com.soccerdev.match.Match;
import com.soccerdev.match.MatchRepository;
import com.soccerdev.player.ParentPlayerRelationshipRepository;
import com.soccerdev.player.Player;
import com.soccerdev.player.PlayerRepository;
import com.soccerdev.player.Position;
import com.soccerdev.report.DevelopmentReport;
import com.soccerdev.report.DevelopmentReportRepository;
import com.soccerdev.season.Season;
import com.soccerdev.team.AgeGroup;
import com.soccerdev.team.CoachTeamAssignmentRepository;
import com.soccerdev.team.CompetitiveLevel;
import com.soccerdev.team.Gender;
import com.soccerdev.team.PlayerTeamAssignmentRepository;
import com.soccerdev.team.Team;
import com.soccerdev.team.TeamRepository;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorizationServiceTest {

    @Mock private PlayerRepository playerRepository;
    @Mock private TeamRepository teamRepository;
    @Mock private MatchRepository matchRepository;
    @Mock private PlayerMatchEvaluationRepository evaluationRepository;
    @Mock private DevelopmentReportRepository reportRepository;
    @Mock private CoachTeamAssignmentRepository coachTeamAssignmentRepository;
    @Mock private ParentPlayerRelationshipRepository parentPlayerRelationshipRepository;
    @Mock private PlayerTeamAssignmentRepository playerTeamAssignmentRepository;

    @InjectMocks
    private AuthorizationService authorizationService;

    // ── Fixtures ──────────────────────────────────────────────────────────────

    private Club club;
    private Club otherClub;
    private Team team;
    private Player player;
    private Match match;
    private PlayerMatchEvaluation evaluation;
    private DevelopmentReport report;

    private User admin;
    private User director;       // belongs to club
    private User directorOther;  // belongs to otherClub
    private User coach;
    private User parent;
    private User playerUser;

    @BeforeEach
    void setUp() {
        club = makeClub(1L, "FC Test");
        otherClub = makeClub(2L, "Rivals FC");

        team = makeTeam(10L, club);
        player = makePlayer(100L);

        match = Match.builder()
                .team(team)
                .opponent("Away FC")
                .matchDateTime(java.time.Instant.now())
                .homeAway(com.soccerdev.match.HomeAway.HOME)
                .build();
        match.setId(200L);

        admin       = makeUser(1L, UserRole.ADMIN, null);
        director    = makeUser(2L, UserRole.DIRECTOR, club);
        directorOther = makeUser(3L, UserRole.DIRECTOR, otherClub);
        coach       = makeUser(4L, UserRole.COACH, null);
        parent      = makeUser(5L, UserRole.PARENT, null);
        playerUser  = makeUser(6L, UserRole.PLAYER, null);

        User coachAuthor = makeUser(4L, UserRole.COACH, null); // same id as coach

        evaluation = PlayerMatchEvaluation.builder()
                .match(match)
                .player(player)
                .coachUser(coachAuthor)
                .build();
        evaluation.setId(300L);

        Season season = Season.builder().name("2024").startDate(LocalDate.now()).endDate(LocalDate.now().plusMonths(6)).build();
        season.setId(50L);

        report = DevelopmentReport.builder()
                .player(player)
                .season(season)
                .generatedByUser(coachAuthor)
                .title("Spring Report")
                .build();
        report.setId(400L);
    }

    // ── canViewPlayer ─────────────────────────────────────────────────────────

    @Nested
    class CanViewPlayer {

        @Test
        void admin_alwaysTrue() {
            assertThat(authorizationService.canViewPlayer(admin, player.getId())).isTrue();
        }

        @Test
        void director_sameClub_true() {
            when(playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(player.getId(), club.getId())).thenReturn(true);
            assertThat(authorizationService.canViewPlayer(director, player.getId())).isTrue();
        }

        @Test
        void director_differentClub_false() {
            when(playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(player.getId(), otherClub.getId())).thenReturn(false);
            assertThat(authorizationService.canViewPlayer(directorOther, player.getId())).isFalse();
        }

        @Test
        void director_playerHasNoTeam_false() {
            when(playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(101L, club.getId())).thenReturn(false);
            assertThat(authorizationService.canViewPlayer(director, 101L)).isFalse();
        }

        @Test
        void coach_assigned_true() {
            when(playerTeamAssignmentRepository.existsByPlayerIdAndCoachUserId(player.getId(), coach.getId())).thenReturn(true);
            assertThat(authorizationService.canViewPlayer(coach, player.getId())).isTrue();
        }

        @Test
        void coach_notAssigned_false() {
            when(playerTeamAssignmentRepository.existsByPlayerIdAndCoachUserId(player.getId(), coach.getId())).thenReturn(false);
            assertThat(authorizationService.canViewPlayer(coach, player.getId())).isFalse();
        }

        @Test
        void parent_hasRelationship_true() {
            when(parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(parent.getId(), player.getId())).thenReturn(true);
            assertThat(authorizationService.canViewPlayer(parent, player.getId())).isTrue();
        }

        @Test
        void parent_noRelationship_false() {
            when(parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(parent.getId(), player.getId())).thenReturn(false);
            assertThat(authorizationService.canViewPlayer(parent, player.getId())).isFalse();
        }

        @Test
        void playerRole_alwaysFalse() {
            assertThat(authorizationService.canViewPlayer(playerUser, player.getId())).isFalse();
        }

        @Test
        void notFound_false() {
            // No active assignment for player 999 → coach check returns false
            assertThat(authorizationService.canViewPlayer(coach, 999L)).isFalse();
        }
    }

    // ── canEditPlayer ─────────────────────────────────────────────────────────

    @Nested
    class CanEditPlayer {

        @Test
        void admin_alwaysTrue() {
            assertThat(authorizationService.canEditPlayer(admin, player.getId())).isTrue();
        }

        @Test
        void parent_alwaysFalse() {
            assertThat(authorizationService.canEditPlayer(parent, player.getId())).isFalse();
        }

        @Test
        void playerRole_alwaysFalse() {
            assertThat(authorizationService.canEditPlayer(playerUser, player.getId())).isFalse();
        }

        @Test
        void coach_assigned_true() {
            when(playerTeamAssignmentRepository.existsByPlayerIdAndCoachUserId(player.getId(), coach.getId())).thenReturn(true);
            assertThat(authorizationService.canEditPlayer(coach, player.getId())).isTrue();
        }
    }

    // ── canViewTeam ───────────────────────────────────────────────────────────

    @Nested
    class CanViewTeam {

        @Test
        void admin_alwaysTrue() {
            assertThat(authorizationService.canViewTeam(admin, team.getId())).isTrue();
        }

        @Test
        void director_sameClub_true() {
            when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
            assertThat(authorizationService.canViewTeam(director, team.getId())).isTrue();
        }

        @Test
        void director_differentClub_false() {
            when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
            assertThat(authorizationService.canViewTeam(directorOther, team.getId())).isFalse();
        }

        @Test
        void coach_assigned_true() {
            when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
            when(coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(coach.getId(), team.getId())).thenReturn(true);
            assertThat(authorizationService.canViewTeam(coach, team.getId())).isTrue();
        }

        @Test
        void parent_hasPlayerOnTeam_true() {
            when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
            when(parentPlayerRelationshipRepository.findPlayerIdsByParentUserId(parent.getId())).thenReturn(Set.of(player.getId()));
            when(playerTeamAssignmentRepository.existsByPlayerIdInAndTeamIdAndActiveTrue(Set.of(player.getId()), team.getId())).thenReturn(true);
            assertThat(authorizationService.canViewTeam(parent, team.getId())).isTrue();
        }

        @Test
        void parent_noPlayerOnTeam_false() {
            when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
            when(parentPlayerRelationshipRepository.findPlayerIdsByParentUserId(parent.getId())).thenReturn(Set.of());
            assertThat(authorizationService.canViewTeam(parent, team.getId())).isFalse();
        }

        @Test
        void playerRole_false() {
            when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
            assertThat(authorizationService.canViewTeam(playerUser, team.getId())).isFalse();
        }

        @Test
        void notFound_false() {
            when(teamRepository.findById(999L)).thenReturn(Optional.empty());
            assertThat(authorizationService.canViewTeam(coach, 999L)).isFalse();
        }
    }

    // ── canEditTeam ───────────────────────────────────────────────────────────

    @Nested
    class CanEditTeam {

        @Test
        void parent_alwaysFalse() {
            assertThat(authorizationService.canEditTeam(parent, team.getId())).isFalse();
        }

        @Test
        void director_sameClub_true() {
            when(teamRepository.findById(team.getId())).thenReturn(Optional.of(team));
            assertThat(authorizationService.canEditTeam(director, team.getId())).isTrue();
        }
    }

    // ── canViewMatch ──────────────────────────────────────────────────────────

    @Nested
    class CanViewMatch {

        @Test
        void admin_alwaysTrue() {
            assertThat(authorizationService.canViewMatch(admin, match.getId())).isTrue();
        }

        @Test
        void director_sameClub_true() {
            when(matchRepository.findById(match.getId())).thenReturn(Optional.of(match));
            assertThat(authorizationService.canViewMatch(director, match.getId())).isTrue();
        }

        @Test
        void coach_assigned_true() {
            when(matchRepository.findById(match.getId())).thenReturn(Optional.of(match));
            when(coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(coach.getId(), team.getId())).thenReturn(true);
            assertThat(authorizationService.canViewMatch(coach, match.getId())).isTrue();
        }

        @Test
        void parent_hasPlayerOnMatchTeam_true() {
            when(matchRepository.findById(match.getId())).thenReturn(Optional.of(match));
            when(parentPlayerRelationshipRepository.findPlayerIdsByParentUserId(parent.getId())).thenReturn(Set.of(player.getId()));
            when(playerTeamAssignmentRepository.existsByPlayerIdInAndTeamIdAndActiveTrue(Set.of(player.getId()), team.getId())).thenReturn(true);
            assertThat(authorizationService.canViewMatch(parent, match.getId())).isTrue();
        }

        @Test
        void playerRole_false() {
            when(matchRepository.findById(match.getId())).thenReturn(Optional.of(match));
            assertThat(authorizationService.canViewMatch(playerUser, match.getId())).isFalse();
        }

        @Test
        void notFound_false() {
            when(matchRepository.findById(999L)).thenReturn(Optional.empty());
            assertThat(authorizationService.canViewMatch(coach, 999L)).isFalse();
        }
    }

    // ── canEditMatch ──────────────────────────────────────────────────────────

    @Nested
    class CanEditMatch {

        @Test
        void parent_alwaysFalse() {
            assertThat(authorizationService.canEditMatch(parent, match.getId())).isFalse();
        }

        @Test
        void coach_notAssigned_false() {
            when(matchRepository.findById(match.getId())).thenReturn(Optional.of(match));
            when(coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(coach.getId(), team.getId())).thenReturn(false);
            assertThat(authorizationService.canEditMatch(coach, match.getId())).isFalse();
        }
    }

    // ── canViewEvaluation ─────────────────────────────────────────────────────

    @Nested
    class CanViewEvaluation {

        @Test
        void admin_alwaysTrue() {
            assertThat(authorizationService.canViewEvaluation(admin, evaluation.getId())).isTrue();
        }

        @Test
        void director_sameClub_true() {
            when(evaluationRepository.findById(evaluation.getId())).thenReturn(Optional.of(evaluation));
            when(playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(player.getId(), club.getId())).thenReturn(true);
            assertThat(authorizationService.canViewEvaluation(director, evaluation.getId())).isTrue();
        }

        @Test
        void coach_authorOfEvaluation_true() {
            when(evaluationRepository.findById(evaluation.getId())).thenReturn(Optional.of(evaluation));
            // coach.getId() == evaluation.coachUser.getId() == 4L
            assertThat(authorizationService.canViewEvaluation(coach, evaluation.getId())).isTrue();
        }

        @Test
        void coach_assignedToMatchTeam_true() {
            User anotherCoach = makeUser(99L, UserRole.COACH, null);
            when(evaluationRepository.findById(evaluation.getId())).thenReturn(Optional.of(evaluation));
            when(coachTeamAssignmentRepository.existsByCoachUserIdAndTeamId(99L, team.getId())).thenReturn(true);
            assertThat(authorizationService.canViewEvaluation(anotherCoach, evaluation.getId())).isTrue();
        }

        @Test
        void parent_hasRelationshipWithPlayer_true() {
            when(evaluationRepository.findById(evaluation.getId())).thenReturn(Optional.of(evaluation));
            when(parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(parent.getId(), player.getId())).thenReturn(true);
            assertThat(authorizationService.canViewEvaluation(parent, evaluation.getId())).isTrue();
        }

        @Test
        void parent_noRelationship_false() {
            when(evaluationRepository.findById(evaluation.getId())).thenReturn(Optional.of(evaluation));
            when(parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(parent.getId(), player.getId())).thenReturn(false);
            assertThat(authorizationService.canViewEvaluation(parent, evaluation.getId())).isFalse();
        }

        @Test
        void notFound_false() {
            when(evaluationRepository.findById(999L)).thenReturn(Optional.empty());
            assertThat(authorizationService.canViewEvaluation(coach, 999L)).isFalse();
        }
    }

    // ── canEditEvaluation ─────────────────────────────────────────────────────

    @Nested
    class CanEditEvaluation {

        @Test
        void coach_isAuthor_true() {
            when(evaluationRepository.findById(evaluation.getId())).thenReturn(Optional.of(evaluation));
            assertThat(authorizationService.canEditEvaluation(coach, evaluation.getId())).isTrue();
        }

        @Test
        void coach_notAuthor_false() {
            User otherCoach = makeUser(77L, UserRole.COACH, null);
            when(evaluationRepository.findById(evaluation.getId())).thenReturn(Optional.of(evaluation));
            assertThat(authorizationService.canEditEvaluation(otherCoach, evaluation.getId())).isFalse();
        }

        @Test
        void parent_alwaysFalse() {
            assertThat(authorizationService.canEditEvaluation(parent, evaluation.getId())).isFalse();
        }

        @Test
        void director_sameClub_true() {
            when(evaluationRepository.findById(evaluation.getId())).thenReturn(Optional.of(evaluation));
            when(playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(player.getId(), club.getId())).thenReturn(true);
            assertThat(authorizationService.canEditEvaluation(director, evaluation.getId())).isTrue();
        }
    }

    // ── canViewDevelopmentReport ──────────────────────────────────────────────

    @Nested
    class CanViewDevelopmentReport {

        @Test
        void admin_alwaysTrue() {
            assertThat(authorizationService.canViewDevelopmentReport(admin, report.getId())).isTrue();
        }

        @Test
        void director_sameClub_true() {
            when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
            when(playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(player.getId(), club.getId())).thenReturn(true);
            assertThat(authorizationService.canViewDevelopmentReport(director, report.getId())).isTrue();
        }

        @Test
        void coach_assignedToPlayerTeam_true() {
            when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
            when(playerTeamAssignmentRepository.existsByPlayerIdAndCoachUserId(player.getId(), coach.getId())).thenReturn(true);
            assertThat(authorizationService.canViewDevelopmentReport(coach, report.getId())).isTrue();
        }

        @Test
        void parent_approvedAndRelated_true() {
            report.setApprovedForParent(true);
            when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
            when(parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(parent.getId(), player.getId())).thenReturn(true);
            assertThat(authorizationService.canViewDevelopmentReport(parent, report.getId())).isTrue();
        }

        @Test
        void parent_notApproved_false() {
            report.setApprovedForParent(false);
            when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
            assertThat(authorizationService.canViewDevelopmentReport(parent, report.getId())).isFalse();
        }

        @Test
        void parent_approvedButNoRelationship_false() {
            report.setApprovedForParent(true);
            when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
            when(parentPlayerRelationshipRepository.existsByParentUserIdAndPlayerId(parent.getId(), player.getId())).thenReturn(false);
            assertThat(authorizationService.canViewDevelopmentReport(parent, report.getId())).isFalse();
        }

        @Test
        void notFound_false() {
            when(reportRepository.findById(999L)).thenReturn(Optional.empty());
            assertThat(authorizationService.canViewDevelopmentReport(coach, 999L)).isFalse();
        }
    }

    // ── canEditDevelopmentReport ──────────────────────────────────────────────

    @Nested
    class CanEditDevelopmentReport {

        @Test
        void coach_isAuthor_true() {
            when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
            assertThat(authorizationService.canEditDevelopmentReport(coach, report.getId())).isTrue();
        }

        @Test
        void coach_notAuthor_false() {
            User otherCoach = makeUser(88L, UserRole.COACH, null);
            when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
            assertThat(authorizationService.canEditDevelopmentReport(otherCoach, report.getId())).isFalse();
        }

        @Test
        void parent_alwaysFalse() {
            assertThat(authorizationService.canEditDevelopmentReport(parent, report.getId())).isFalse();
        }

        @Test
        void director_sameClub_true() {
            when(reportRepository.findById(report.getId())).thenReturn(Optional.of(report));
            when(playerTeamAssignmentRepository.existsByPlayerIdAndTeamClubIdAndActiveTrue(player.getId(), club.getId())).thenReturn(true);
            assertThat(authorizationService.canEditDevelopmentReport(director, report.getId())).isTrue();
        }

        @Test
        void admin_alwaysTrue() {
            assertThat(authorizationService.canEditDevelopmentReport(admin, report.getId())).isTrue();
        }
    }

    // ── Fixture builders ──────────────────────────────────────────────────────

    private Club makeClub(Long id, String name) {
        Club c = Club.builder().name(name).build();
        c.setId(id);
        return c;
    }

    private Team makeTeam(Long id, Club club) {
        Team t = Team.builder()
                .club(club)
                .name("Team " + id)
                .ageGroup(AgeGroup.U14)
                .gender(Gender.MALE)
                .competitiveLevel(CompetitiveLevel.COMPETITIVE)
                .build();
        t.setId(id);
        return t;
    }

    private Player makePlayer(Long id) {
        Player p = Player.builder()
                .firstName("Player")
                .lastName("" + id)
                .dateOfBirth(LocalDate.of(2010, 1, 1))
                .primaryPosition(Position.CM)
                .build();
        p.setId(id);
        return p;
    }

    private User makeUser(Long id, UserRole role, Club club) {
        User u = User.builder()
                .email(role.name().toLowerCase() + id + "@test.com")
                .passwordHash("hash")
                .firstName(role.name())
                .lastName("User")
                .role(role)
                .club(club)
                .build();
        u.setId(id);
        return u;
    }
}

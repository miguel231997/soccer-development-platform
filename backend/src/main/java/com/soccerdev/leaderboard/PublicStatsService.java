package com.soccerdev.leaderboard;

import com.soccerdev.club.Club;
import com.soccerdev.player.Player;
import com.soccerdev.player.PlayerRepository;
import com.soccerdev.player.Position;
import com.soccerdev.stats.PlayerMatchStats;
import com.soccerdev.stats.PlayerMatchStatsRepository;
import com.soccerdev.team.AgeGroup;
import com.soccerdev.team.Team;
import com.soccerdev.team.TeamRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicStatsService {

    private final PlayerMatchStatsRepository statsRepository;
    private final PlayerRepository playerRepository;
    private final TeamRepository teamRepository;

    public List<PlayerLeaderboardEntry> getLeaderboard(
            Long seasonId, Long seasonPhaseId, Long competitionId,
            Long teamId, Long clubId,
            AgeGroup ageGroup, Position position,
            LeaderboardStat stat, int minAppearances) {

        List<PlayerMatchStats> raw = statsRepository.findPublicStats(
                seasonId, seasonPhaseId, competitionId, teamId, clubId);

        return aggregate(raw, ageGroup, position, minAppearances, stat);
    }

    public PublicPlayerProfile getPublicPlayerProfile(Long playerId) {
        Player player = playerRepository.findByIdAndPublicProfileEnabledTrueAndActiveTrue(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found with id: " + playerId));

        List<PlayerMatchStats> stats = statsRepository.findByPlayerId(playerId);

        // Use first active team assignment for profile context; null-safe if player has no active team yet
        var activeAssignment = player.getTeamAssignments().stream()
                .filter(ta -> ta.isActive())
                .findFirst()
                .orElse(null);
        Team team = activeAssignment != null ? activeAssignment.getTeam() : null;
        Club club = team != null ? team.getClub() : null;

        return PublicPlayerProfile.builder()
                .id(player.getId())
                .firstName(player.getFirstName())
                .lastName(player.getLastName())
                .primaryPosition(player.getPrimaryPosition())
                .secondaryPosition(player.getSecondaryPosition())
                .strongFoot(player.getStrongFoot())
                .jerseyNumber(player.getJerseyNumber())
                .profileImageUrl(player.getProfileImageUrl())
                .teamId(team != null ? team.getId() : null)
                .teamName(team != null ? team.getName() : null)
                .ageGroup(team != null ? team.getAgeGroup() : null)
                .clubId(club != null ? club.getId() : null)
                .clubName(club != null ? club.getName() : null)
                .appearances(stats.size())
                .minutesPlayed(sumLong(stats, s -> s.getMinutesPlayed() != null ? (long) s.getMinutesPlayed() : 0L))
                .goals(sumLong(stats, s -> (long) s.getGoals()))
                .assists(sumLong(stats, s -> (long) s.getAssists()))
                .shots(sumLong(stats, s -> (long) s.getShots()))
                .shotsOnTarget(sumLong(stats, s -> (long) s.getShotsOnTarget()))
                .saves(sumLong(stats, s -> (long) s.getSaves()))
                .cleanSheets((int) stats.stream().filter(PlayerMatchStats::isCleanSheet).count())
                .xg(sumBigDecimal(stats, PlayerMatchStats::getXg))
                .xa(sumBigDecimal(stats, PlayerMatchStats::getXa))
                .xt(sumBigDecimal(stats, PlayerMatchStats::getXt))
                .dangerPrevented(sumBigDecimal(stats, PlayerMatchStats::getDangerPrevented))
                .build();
    }

    public PublicTeamStats getPublicTeamStats(Long teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + teamId));

        List<PlayerMatchStats> raw = statsRepository.findPublicStats(null, null, null, teamId, null);
        List<PlayerLeaderboardEntry> players = aggregate(raw, null, null, 0, LeaderboardStat.GOALS);

        Club club = team.getClub();
        return PublicTeamStats.builder()
                .teamId(team.getId())
                .teamName(team.getName())
                .ageGroup(team.getAgeGroup())
                .gender(team.getGender())
                .competitiveLevel(team.getCompetitiveLevel())
                .clubId(club != null ? club.getId() : null)
                .clubName(club != null ? club.getName() : null)
                .players(players)
                .build();
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private List<PlayerLeaderboardEntry> aggregate(
            List<PlayerMatchStats> raw,
            AgeGroup ageGroup, Position position,
            int minAppearances, LeaderboardStat stat) {

        var stream = raw.stream();

        if (ageGroup != null) {
            stream = stream.filter(s -> ageGroup == s.getMatch().getTeam().getAgeGroup());
        }
        if (position != null) {
            stream = stream.filter(s -> position == s.getPlayer().getPrimaryPosition());
        }

        Map<Long, List<PlayerMatchStats>> byPlayer =
                stream.collect(Collectors.groupingBy(s -> s.getPlayer().getId()));

        return byPlayer.values().stream()
                .map(this::toEntry)
                .filter(e -> e.getAppearances() >= Math.max(minAppearances, 0))
                .sorted(comparatorFor(stat))
                .toList();
    }

    private PlayerLeaderboardEntry toEntry(List<PlayerMatchStats> stats) {
        Player p = stats.get(0).getPlayer();
        Team t = stats.get(0).getMatch().getTeam();
        Club c = t != null ? t.getClub() : null;

        return PlayerLeaderboardEntry.builder()
                .playerId(p.getId())
                .playerName(p.getFirstName() + " " + p.getLastName())
                .position(p.getPrimaryPosition())
                .teamId(t != null ? t.getId() : null)
                .teamName(t != null ? t.getName() : null)
                .ageGroup(t != null ? t.getAgeGroup() : null)
                .clubId(c != null ? c.getId() : null)
                .clubName(c != null ? c.getName() : null)
                .appearances(stats.size())
                .minutesPlayed(sumLong(stats, s -> s.getMinutesPlayed() != null ? (long) s.getMinutesPlayed() : 0L))
                .goals(sumLong(stats, s -> (long) s.getGoals()))
                .assists(sumLong(stats, s -> (long) s.getAssists()))
                .shots(sumLong(stats, s -> (long) s.getShots()))
                .shotsOnTarget(sumLong(stats, s -> (long) s.getShotsOnTarget()))
                .saves(sumLong(stats, s -> (long) s.getSaves()))
                .cleanSheets((int) stats.stream().filter(PlayerMatchStats::isCleanSheet).count())
                .xg(sumBigDecimal(stats, PlayerMatchStats::getXg))
                .xa(sumBigDecimal(stats, PlayerMatchStats::getXa))
                .xt(sumBigDecimal(stats, PlayerMatchStats::getXt))
                .dangerPrevented(sumBigDecimal(stats, PlayerMatchStats::getDangerPrevented))
                .build();
    }

    private Comparator<PlayerLeaderboardEntry> comparatorFor(LeaderboardStat stat) {
        return switch (stat) {
            case GOALS         -> Comparator.comparingLong(PlayerLeaderboardEntry::getGoals).reversed();
            case ASSISTS       -> Comparator.comparingLong(PlayerLeaderboardEntry::getAssists).reversed();
            case GOALS_ASSISTS -> Comparator.comparingLong(
                    (PlayerLeaderboardEntry e) -> e.getGoals() + e.getAssists()).reversed();
            case MINUTES       -> Comparator.comparingLong(PlayerLeaderboardEntry::getMinutesPlayed).reversed();
            case APPEARANCES   -> Comparator.comparingInt(PlayerLeaderboardEntry::getAppearances).reversed();
            case SHOTS         -> Comparator.comparingLong(PlayerLeaderboardEntry::getShots).reversed();
            case SHOTS_ON_TARGET -> Comparator.comparingLong(PlayerLeaderboardEntry::getShotsOnTarget).reversed();
            case XG            -> bigDecimalComparator(PlayerLeaderboardEntry::getXg);
            case XA            -> bigDecimalComparator(PlayerLeaderboardEntry::getXa);
            case XT            -> bigDecimalComparator(PlayerLeaderboardEntry::getXt);
            case DANGER_PREVENTED -> bigDecimalComparator(PlayerLeaderboardEntry::getDangerPrevented);
        };
    }

    private Comparator<PlayerLeaderboardEntry> bigDecimalComparator(
            Function<PlayerLeaderboardEntry, BigDecimal> getter) {
        return Comparator.comparing(
                e -> getter.apply(e) != null ? getter.apply(e) : BigDecimal.ZERO,
                Comparator.reverseOrder());
    }

    private long sumLong(List<PlayerMatchStats> stats, Function<PlayerMatchStats, Long> getter) {
        return stats.stream().mapToLong(getter::apply).sum();
    }

    private BigDecimal sumBigDecimal(List<PlayerMatchStats> stats, Function<PlayerMatchStats, BigDecimal> getter) {
        List<BigDecimal> values = stats.stream().map(getter).filter(Objects::nonNull).toList();
        if (values.isEmpty()) return null;
        return values.stream().reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}

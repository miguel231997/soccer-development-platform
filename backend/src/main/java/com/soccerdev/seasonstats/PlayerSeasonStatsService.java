package com.soccerdev.seasonstats;

import com.soccerdev.player.Player;
import com.soccerdev.player.PlayerRepository;
import com.soccerdev.security.AuthorizationService;
import com.soccerdev.stats.PlayerMatchStats;
import com.soccerdev.stats.PlayerMatchStatsRepository;
import com.soccerdev.team.Team;
import com.soccerdev.user.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlayerSeasonStatsService {

    private final PlayerSeasonStatsRepository repository;
    private final PlayerRepository playerRepository;
    private final AuthorizationService authorizationService;
    private final PlayerMatchStatsRepository matchStatsRepository;

    public PlayerSeasonStatsResponse getForPlayer(User user, Long playerId) {
        if (!playerRepository.existsById(playerId)) {
            throw new EntityNotFoundException("Player not found with id: " + playerId);
        }
        if (!authorizationService.canViewPlayer(user, playerId)) {
            throw new AccessDeniedException("Access denied");
        }
        return buildResponse(playerId);
    }

    public PlayerSeasonStatsResponse getPublicForPlayer(Long playerId) {
        Player player = playerRepository.findByIdAndPublicProfileEnabledTrueAndActiveTrue(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found"));
        return buildResponse(player.getId());
    }

    private PlayerSeasonStatsResponse buildResponse(Long playerId) {
        List<PlayerMatchStats> playerMatchStats = matchStatsRepository.findByPlayerId(playerId);

        if (!playerMatchStats.isEmpty()) {
            return buildFromMatchStats(playerId, playerMatchStats);
        }

        return buildFromSeasonStats(playerId);
    }

    private PlayerSeasonStatsResponse buildFromMatchStats(Long playerId, List<PlayerMatchStats> playerStats) {
        // Determine team from most recent match
        PlayerMatchStats latest = playerStats.stream()
                .filter(s -> s.getMatch() != null && s.getMatch().getMatchDateTime() != null)
                .max(Comparator.comparing(s -> s.getMatch().getMatchDateTime()))
                .orElse(playerStats.get(0));

        Team team = latest.getMatch().getTeam();
        String seasonName = latest.getMatch().getSeason() != null
                ? latest.getMatch().getSeason().getName() : null;

        // Aggregate player's totals
        Totals mine = aggregate(playerStats);

        // Get all match stats for the same team; group by player; compute per-player totals
        List<PlayerMatchStats> allTeamStats = matchStatsRepository.findByTeamId(team.getId());
        Map<Long, List<PlayerMatchStats>> byPlayer = allTeamStats.stream()
                .collect(Collectors.groupingBy(s -> s.getPlayer().getId()));

        List<Totals> peerTotals = byPlayer.values().stream().map(this::aggregate).toList();

        return PlayerSeasonStatsResponse.builder()
                .playerId(playerId)
                .teamName(team.getName())
                .seasonName(seasonName)
                // Shooting
                .goals(stat(mine.goals, peerTotals.stream().map(t -> t.goals).toList(), false))
                .shots(stat(mine.shots, peerTotals.stream().map(t -> t.shots).toList(), false))
                .shotsOnTarget(stat(mine.shotsOnTarget, peerTotals.stream().map(t -> t.shotsOnTarget).toList(), false))
                // Passing
                .assists(stat(mine.assists, peerTotals.stream().map(t -> t.assists).toList(), false))
                .successfulPasses(stat(mine.successfulPasses, peerTotals.stream().map(t -> t.successfulPasses).toList(), false))
                .accurateLongBalls(stat(mine.accurateLongBalls, peerTotals.stream().map(t -> t.accurateLongBalls).toList(), false))
                .chancesCreated(stat(mine.chancesCreated, peerTotals.stream().map(t -> t.chancesCreated).toList(), false))
                .successfulCrosses(stat(mine.successfulCrosses, peerTotals.stream().map(t -> t.successfulCrosses).toList(), false))
                // Possession
                .successfulDribbles(stat(mine.successfulDribbles, peerTotals.stream().map(t -> t.successfulDribbles).toList(), false))
                .duelsWon(stat(mine.duelsWon, peerTotals.stream().map(t -> t.duelsWon).toList(), false))
                .dispossessed(stat(mine.dispossessed, peerTotals.stream().map(t -> t.dispossessed).toList(), true))
                .foulsWon(stat(mine.foulsWon, peerTotals.stream().map(t -> t.foulsWon).toList(), false))
                // Defending
                .tackles(stat(mine.tackles, peerTotals.stream().map(t -> t.tackles).toList(), false))
                .interceptions(stat(mine.interceptions, peerTotals.stream().map(t -> t.interceptions).toList(), false))
                .foulsCommitted(stat(mine.foulsCommitted, peerTotals.stream().map(t -> t.foulsCommitted).toList(), true))
                .blockedShots(stat(mine.blockedShots, peerTotals.stream().map(t -> t.blockedShots).toList(), false))
                .clearances(stat(mine.clearances, peerTotals.stream().map(t -> t.clearances).toList(), false))
                .goalsConceded(stat(mine.goalsConceded, peerTotals.stream().map(t -> t.goalsConceded).toList(), true))
                // Discipline
                .yellowCards(stat(mine.yellowCards, peerTotals.stream().map(t -> t.yellowCards).toList(), true))
                .redCards(stat(mine.redCards, peerTotals.stream().map(t -> t.redCards).toList(), true))
                .build();
    }

    private PlayerSeasonStatsResponse buildFromSeasonStats(Long playerId) {
        List<PlayerSeasonStats> allPlayerStats = repository.findByPlayerIdOrderByCreatedAtDesc(playerId);
        if (allPlayerStats.isEmpty()) return null;

        PlayerSeasonStats s = allPlayerStats.get(0);

        List<PlayerSeasonStats> peers = s.getSeason() != null
                ? repository.findByTeamAndSeason(s.getTeam().getId(), s.getSeason().getId())
                : repository.findByTeamAndNoSeason(s.getTeam().getId());

        return PlayerSeasonStatsResponse.builder()
                .playerId(playerId)
                .teamName(s.getTeam().getName())
                .seasonName(s.getSeason() != null ? s.getSeason().getName() : null)
                .goals(stat(s.getGoals(), vals(peers, PlayerSeasonStats::getGoals), false))
                .shots(stat(s.getShots(), vals(peers, PlayerSeasonStats::getShots), false))
                .shotsOnTarget(stat(s.getShotsOnTarget(), vals(peers, PlayerSeasonStats::getShotsOnTarget), false))
                .assists(stat(s.getAssists(), vals(peers, PlayerSeasonStats::getAssists), false))
                .successfulPasses(stat(s.getSuccessfulPasses(), vals(peers, PlayerSeasonStats::getSuccessfulPasses), false))
                .accurateLongBalls(stat(s.getAccurateLongBalls(), vals(peers, PlayerSeasonStats::getAccurateLongBalls), false))
                .chancesCreated(stat(s.getChancesCreated(), vals(peers, PlayerSeasonStats::getChancesCreated), false))
                .successfulCrosses(stat(s.getSuccessfulCrosses(), vals(peers, PlayerSeasonStats::getSuccessfulCrosses), false))
                .successfulDribbles(stat(s.getSuccessfulDribbles(), vals(peers, PlayerSeasonStats::getSuccessfulDribbles), false))
                .duelsWon(stat(s.getDuelsWon(), vals(peers, PlayerSeasonStats::getDuelsWon), false))
                .dispossessed(stat(s.getDispossessed(), vals(peers, PlayerSeasonStats::getDispossessed), true))
                .foulsWon(stat(s.getFoulsWon(), vals(peers, PlayerSeasonStats::getFoulsWon), false))
                .tackles(stat(s.getTackles(), vals(peers, PlayerSeasonStats::getTackles), false))
                .interceptions(stat(s.getInterceptions(), vals(peers, PlayerSeasonStats::getInterceptions), false))
                .foulsCommitted(stat(s.getFoulsCommitted(), vals(peers, PlayerSeasonStats::getFoulsCommitted), true))
                .blockedShots(stat(s.getBlockedShots(), vals(peers, PlayerSeasonStats::getBlockedShots), false))
                .clearances(stat(s.getClearances(), vals(peers, PlayerSeasonStats::getClearances), false))
                .goalsConceded(stat(s.getGoalsConceded(), vals(peers, PlayerSeasonStats::getGoalsConceded), true))
                .yellowCards(stat(s.getYellowCards(), vals(peers, PlayerSeasonStats::getYellowCards), true))
                .redCards(stat(s.getRedCards(), vals(peers, PlayerSeasonStats::getRedCards), true))
                .build();
    }

    private Totals aggregate(List<PlayerMatchStats> list) {
        Totals t = new Totals();
        t.goals            = list.stream().mapToInt(PlayerMatchStats::getGoals).sum();
        t.shots            = list.stream().mapToInt(PlayerMatchStats::getShots).sum();
        t.shotsOnTarget    = list.stream().mapToInt(PlayerMatchStats::getShotsOnTarget).sum();
        t.assists          = list.stream().mapToInt(PlayerMatchStats::getAssists).sum();
        t.successfulPasses = list.stream().mapToInt(PlayerMatchStats::getSuccessfulPasses).sum();
        t.accurateLongBalls= list.stream().mapToInt(PlayerMatchStats::getAccurateLongBalls).sum();
        t.chancesCreated   = list.stream().mapToInt(PlayerMatchStats::getChancesCreated).sum();
        t.successfulCrosses= list.stream().mapToInt(PlayerMatchStats::getSuccessfulCrosses).sum();
        t.successfulDribbles=list.stream().mapToInt(PlayerMatchStats::getSuccessfulDribbles).sum();
        t.duelsWon         = list.stream().mapToInt(PlayerMatchStats::getDuelsWon).sum();
        t.dispossessed     = list.stream().mapToInt(PlayerMatchStats::getDispossessed).sum();
        t.foulsWon         = list.stream().mapToInt(PlayerMatchStats::getFoulsWon).sum();
        t.tackles          = list.stream().mapToInt(PlayerMatchStats::getTackles).sum();
        t.interceptions    = list.stream().mapToInt(PlayerMatchStats::getInterceptions).sum();
        t.foulsCommitted   = list.stream().mapToInt(PlayerMatchStats::getFoulsCommitted).sum();
        t.blockedShots     = list.stream().mapToInt(PlayerMatchStats::getBlockedShots).sum();
        t.clearances       = list.stream().mapToInt(PlayerMatchStats::getClearances).sum();
        t.goalsConceded    = list.stream().mapToInt(PlayerMatchStats::getGoalsConceded).sum();
        t.yellowCards      = list.stream().mapToInt(PlayerMatchStats::getYellowCards).sum();
        t.redCards         = list.stream().mapToInt(PlayerMatchStats::getRedCards).sum();
        return t;
    }

    private static class Totals {
        int goals, shots, shotsOnTarget, assists, successfulPasses, accurateLongBalls,
            chancesCreated, successfulCrosses, successfulDribbles, duelsWon, dispossessed,
            foulsWon, tackles, interceptions, foulsCommitted, blockedShots, clearances,
            goalsConceded, yellowCards, redCards;
    }

    private interface IntGetter { int get(PlayerSeasonStats s); }

    private List<Integer> vals(List<PlayerSeasonStats> list, IntGetter getter) {
        return list.stream().map(getter::get).toList();
    }

    private StatEntry stat(int value, List<Integer> allValues, boolean lowerIsBetter) {
        return new StatEntry(value, percentile(value, allValues, lowerIsBetter));
    }

    private int percentile(int value, List<Integer> all, boolean lowerIsBetter) {
        int n = all.size();
        if (n <= 1) return 50;
        long distinct = all.stream().distinct().count();
        if (distinct == 1) return 50;

        long beaten = lowerIsBetter
                ? all.stream().filter(v -> v > value).count()
                : all.stream().filter(v -> v < value).count();

        return (int) Math.round((double) beaten / (n - 1) * 100);
    }
}

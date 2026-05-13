package com.soccerdev.seasonstats;

import com.soccerdev.player.Player;
import com.soccerdev.player.PlayerRepository;
import com.soccerdev.security.AuthorizationService;
import com.soccerdev.user.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlayerSeasonStatsService {

    private final PlayerSeasonStatsRepository repository;
    private final PlayerRepository playerRepository;
    private final AuthorizationService authorizationService;

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
                // Shooting
                .goals(stat(s.getGoals(), vals(peers, PlayerSeasonStats::getGoals), false))
                .shots(stat(s.getShots(), vals(peers, PlayerSeasonStats::getShots), false))
                .shotsOnTarget(stat(s.getShotsOnTarget(), vals(peers, PlayerSeasonStats::getShotsOnTarget), false))
                // Passing
                .assists(stat(s.getAssists(), vals(peers, PlayerSeasonStats::getAssists), false))
                .successfulPasses(stat(s.getSuccessfulPasses(), vals(peers, PlayerSeasonStats::getSuccessfulPasses), false))
                .accurateLongBalls(stat(s.getAccurateLongBalls(), vals(peers, PlayerSeasonStats::getAccurateLongBalls), false))
                .chancesCreated(stat(s.getChancesCreated(), vals(peers, PlayerSeasonStats::getChancesCreated), false))
                .successfulCrosses(stat(s.getSuccessfulCrosses(), vals(peers, PlayerSeasonStats::getSuccessfulCrosses), false))
                // Possession
                .successfulDribbles(stat(s.getSuccessfulDribbles(), vals(peers, PlayerSeasonStats::getSuccessfulDribbles), false))
                .duelsWon(stat(s.getDuelsWon(), vals(peers, PlayerSeasonStats::getDuelsWon), false))
                .dispossessed(stat(s.getDispossessed(), vals(peers, PlayerSeasonStats::getDispossessed), true))
                .foulsWon(stat(s.getFoulsWon(), vals(peers, PlayerSeasonStats::getFoulsWon), false))
                // Defending
                .tackles(stat(s.getTackles(), vals(peers, PlayerSeasonStats::getTackles), false))
                .interceptions(stat(s.getInterceptions(), vals(peers, PlayerSeasonStats::getInterceptions), false))
                .foulsCommitted(stat(s.getFoulsCommitted(), vals(peers, PlayerSeasonStats::getFoulsCommitted), true))
                .blockedShots(stat(s.getBlockedShots(), vals(peers, PlayerSeasonStats::getBlockedShots), false))
                .clearances(stat(s.getClearances(), vals(peers, PlayerSeasonStats::getClearances), false))
                .goalsConceded(stat(s.getGoalsConceded(), vals(peers, PlayerSeasonStats::getGoalsConceded), true))
                // Discipline
                .yellowCards(stat(s.getYellowCards(), vals(peers, PlayerSeasonStats::getYellowCards), true))
                .redCards(stat(s.getRedCards(), vals(peers, PlayerSeasonStats::getRedCards), true))
                .build();
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

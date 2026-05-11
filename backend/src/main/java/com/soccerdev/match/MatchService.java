package com.soccerdev.match;

import com.soccerdev.competition.Competition;
import com.soccerdev.competition.CompetitionRepository;
import com.soccerdev.season.Season;
import com.soccerdev.season.SeasonPhase;
import com.soccerdev.season.SeasonPhaseRepository;
import com.soccerdev.season.SeasonRepository;
import com.soccerdev.security.AuthorizationService;
import com.soccerdev.team.Team;
import com.soccerdev.team.TeamRepository;
import com.soccerdev.user.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchService {

    private final MatchRepository matchRepository;
    private final TeamRepository teamRepository;
    private final SeasonRepository seasonRepository;
    private final SeasonPhaseRepository seasonPhaseRepository;
    private final CompetitionRepository competitionRepository;
    private final AuthorizationService authorizationService;

    public List<MatchResponse> list(User user) {
        List<Match> matches = switch (user.getRole()) {
            case ADMIN  -> matchRepository.findAllByOrderByMatchDateTimeDesc();
            case DIRECTOR -> user.getClub() != null
                    ? matchRepository.findByTeamClubId(user.getClub().getId())
                    : Collections.emptyList();
            case COACH  -> matchRepository.findByAssignedCoachId(user.getId());
            case PARENT -> matchRepository.findByParentId(user.getId());
            case PLAYER -> Collections.emptyList();
        };
        return matches.stream().map(this::toResponse).toList();
    }

    public MatchResponse getById(User user, Long id) {
        Match match = findOrThrow(id);
        if (!authorizationService.canViewMatch(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        return toResponse(match);
    }

    public List<MatchResponse> listByTeam(User user, Long teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new EntityNotFoundException("Team not found with id: " + teamId);
        }
        if (!authorizationService.canViewTeam(user, teamId)) {
            throw new AccessDeniedException("Access denied");
        }
        return matchRepository.findByTeamIdOrderByMatchDateTimeDesc(teamId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public MatchResponse create(User user, MatchRequest request) {
        if (!authorizationService.canEditTeam(user, request.getTeamId())) {
            throw new AccessDeniedException("Access denied");
        }
        Match match = buildMatch(new Match(), request);
        return toResponse(matchRepository.save(match));
    }

    @Transactional
    public MatchResponse update(User user, Long id, MatchRequest request) {
        Match match = findOrThrow(id);
        if (!authorizationService.canEditMatch(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        if (match.isFinalized()) {
            throw new IllegalArgumentException("Cannot modify a finalized match");
        }
        return toResponse(matchRepository.save(buildMatch(match, request)));
    }

    @Transactional
    public void delete(User user, Long id) {
        findOrThrow(id);
        if (!authorizationService.canEditMatch(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        matchRepository.deleteById(id);
    }

    @Transactional
    public MatchResponse finalize(User user, Long id) {
        Match match = findOrThrow(id);
        if (!authorizationService.canEditMatch(user, id)) {
            throw new AccessDeniedException("Access denied");
        }
        match.setFinalized(true);
        return toResponse(matchRepository.save(match));
    }

    private Match buildMatch(Match match, MatchRequest request) {
        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new EntityNotFoundException("Team not found with id: " + request.getTeamId()));
        Season season = seasonRepository.findById(request.getSeasonId())
                .orElseThrow(() -> new EntityNotFoundException("Season not found with id: " + request.getSeasonId()));

        SeasonPhase seasonPhase = null;
        if (request.getSeasonPhaseId() != null) {
            seasonPhase = seasonPhaseRepository.findById(request.getSeasonPhaseId())
                    .orElseThrow(() -> new EntityNotFoundException("Season phase not found with id: " + request.getSeasonPhaseId()));
        }

        Competition competition = null;
        if (request.getCompetitionId() != null) {
            competition = competitionRepository.findById(request.getCompetitionId())
                    .orElseThrow(() -> new EntityNotFoundException("Competition not found with id: " + request.getCompetitionId()));
        }

        match.setTeam(team);
        match.setSeason(season);
        match.setSeasonPhase(seasonPhase);
        match.setCompetition(competition);
        match.setOpponent(request.getOpponent());
        match.setMatchDateTime(request.getMatchDateTime());
        match.setLocation(request.getLocation());
        match.setHomeAway(request.getHomeAway());
        match.setHomeScore(request.getHomeScore());
        match.setAwayScore(request.getAwayScore());
        return match;
    }

    private Match findOrThrow(Long id) {
        return matchRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Match not found with id: " + id));
    }

    private MatchResponse toResponse(Match match) {
        MatchResponse.MatchResponseBuilder builder = MatchResponse.builder()
                .id(match.getId())
                .teamId(match.getTeam().getId())
                .teamName(match.getTeam().getName())
                .seasonId(match.getSeason().getId())
                .seasonName(match.getSeason().getName())
                .opponent(match.getOpponent())
                .matchDateTime(match.getMatchDateTime())
                .location(match.getLocation())
                .homeAway(match.getHomeAway())
                .homeScore(match.getHomeScore())
                .awayScore(match.getAwayScore())
                .finalized(match.isFinalized())
                .createdAt(match.getCreatedAt())
                .updatedAt(match.getUpdatedAt());

        if (match.getSeasonPhase() != null) {
            builder.seasonPhaseId(match.getSeasonPhase().getId())
                   .seasonPhaseName(match.getSeasonPhase().getName());
        }
        if (match.getCompetition() != null) {
            builder.competitionId(match.getCompetition().getId())
                   .competitionName(match.getCompetition().getName())
                   .competitionType(match.getCompetition().getType());
        }

        return builder.build();
    }
}

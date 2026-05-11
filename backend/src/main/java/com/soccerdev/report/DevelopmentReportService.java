package com.soccerdev.report;

import com.soccerdev.player.Player;
import com.soccerdev.player.PlayerRepository;
import com.soccerdev.season.Season;
import com.soccerdev.season.SeasonRepository;
import com.soccerdev.security.AuthorizationService;
import com.soccerdev.user.User;
import com.soccerdev.user.UserRole;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DevelopmentReportService {

    private final DevelopmentReportRepository reportRepository;
    private final PlayerRepository playerRepository;
    private final SeasonRepository seasonRepository;
    private final AuthorizationService authorizationService;

    @Transactional
    public CoachDevelopmentReportDto create(User author, Long playerId, ReportRequest request) {
        Player player = playerRepository.findById(playerId)
                .orElseThrow(() -> new EntityNotFoundException("Player not found with id: " + playerId));

        if (!authorizationService.canEditPlayer(author, playerId)) {
            throw new AccessDeniedException("Access denied");
        }

        Season season = seasonRepository.findById(request.getSeasonId())
                .orElseThrow(() -> new EntityNotFoundException("Season not found with id: " + request.getSeasonId()));

        DevelopmentReport report = DevelopmentReport.builder()
                .player(player)
                .season(season)
                .generatedByUser(author)
                .build();
        applyRequest(report, request);

        return toCoachDto(reportRepository.save(report));
    }

    public List<ReportView> listByPlayer(User user, Long playerId) {
        if (!playerRepository.existsById(playerId)) {
            throw new EntityNotFoundException("Player not found with id: " + playerId);
        }
        if (!authorizationService.canViewPlayer(user, playerId)) {
            throw new AccessDeniedException("Access denied");
        }

        if (user.getRole() == UserRole.PARENT) {
            return reportRepository.findByPlayerIdAndApprovedForParent(playerId, true)
                    .stream()
                    .map(r -> (ReportView) toParentDto(r))
                    .toList();
        }

        return reportRepository.findByPlayerId(playerId)
                .stream()
                .map(r -> (ReportView) toCoachDto(r))
                .toList();
    }

    public ReportView getById(User user, Long reportId) {
        DevelopmentReport report = findOrThrow(reportId);
        if (!authorizationService.canViewDevelopmentReport(user, reportId)) {
            throw new AccessDeniedException("Access denied");
        }
        if (user.getRole() == UserRole.PARENT) {
            return toParentDto(report);
        }
        return toCoachDto(report);
    }

    @Transactional
    public CoachDevelopmentReportDto update(User user, Long reportId, ReportRequest request) {
        DevelopmentReport report = findOrThrow(reportId);
        if (!authorizationService.canEditDevelopmentReport(user, reportId)) {
            throw new AccessDeniedException("Access denied");
        }

        Season season = seasonRepository.findById(request.getSeasonId())
                .orElseThrow(() -> new EntityNotFoundException("Season not found with id: " + request.getSeasonId()));
        report.setSeason(season);
        applyRequest(report, request);

        return toCoachDto(reportRepository.save(report));
    }

    @Transactional
    public CoachDevelopmentReportDto approve(User user, Long reportId) {
        DevelopmentReport report = findOrThrow(reportId);
        if (!authorizationService.canEditDevelopmentReport(user, reportId)) {
            throw new AccessDeniedException("Access denied");
        }
        report.setApprovedForParent(true);
        return toCoachDto(reportRepository.save(report));
    }

    @Transactional
    public CoachDevelopmentReportDto unapprove(User user, Long reportId) {
        DevelopmentReport report = findOrThrow(reportId);
        if (!authorizationService.canEditDevelopmentReport(user, reportId)) {
            throw new AccessDeniedException("Access denied");
        }
        report.setApprovedForParent(false);
        return toCoachDto(reportRepository.save(report));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void applyRequest(DevelopmentReport report, ReportRequest req) {
        report.setTitle(req.getTitle());
        report.setStrengths(req.getStrengths());
        report.setAreasToImprove(req.getAreasToImprove());
        report.setTrainingFocus(req.getTrainingFocus());
        report.setParentSummary(req.getParentSummary());
        report.setCoachOnlyAnalysis(req.getCoachOnlyAnalysis());
    }

    private CoachDevelopmentReportDto toCoachDto(DevelopmentReport report) {
        Player p = report.getPlayer();
        Season s = report.getSeason();
        User author = report.getGeneratedByUser();
        return CoachDevelopmentReportDto.builder()
                .id(report.getId())
                .playerId(p.getId())
                .playerName(p.getFirstName() + " " + p.getLastName())
                .seasonId(s.getId())
                .seasonName(s.getName())
                .generatedByUserId(author.getId())
                .generatedByUserName(author.getFirstName() + " " + author.getLastName())
                .title(report.getTitle())
                .strengths(report.getStrengths())
                .areasToImprove(report.getAreasToImprove())
                .trainingFocus(report.getTrainingFocus())
                .parentSummary(report.getParentSummary())
                .coachOnlyAnalysis(report.getCoachOnlyAnalysis())
                .approvedForParent(report.isApprovedForParent())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }

    private ParentDevelopmentReportDto toParentDto(DevelopmentReport report) {
        Player p = report.getPlayer();
        Season s = report.getSeason();
        return ParentDevelopmentReportDto.builder()
                .id(report.getId())
                .playerId(p.getId())
                .playerName(p.getFirstName() + " " + p.getLastName())
                .seasonId(s.getId())
                .seasonName(s.getName())
                .title(report.getTitle())
                .strengths(report.getStrengths())
                .areasToImprove(report.getAreasToImprove())
                .trainingFocus(report.getTrainingFocus())
                .parentSummary(report.getParentSummary())
                .approvedForParent(report.isApprovedForParent())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }

    private DevelopmentReport findOrThrow(Long id) {
        return reportRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Report not found with id: " + id));
    }
}

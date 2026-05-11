package com.soccerdev.report;

/** Marker interface so service methods return List<ReportView> while Jackson
 *  serialises the concrete type (CoachDevelopmentReportDto or ParentDevelopmentReportDto). */
public interface ReportView {
}

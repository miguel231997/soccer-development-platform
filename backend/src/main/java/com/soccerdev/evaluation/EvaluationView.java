package com.soccerdev.evaluation;

/** Marker interface returned by read methods so the controller stays typed while
 *  Jackson serialises the concrete DTO (CoachEvaluationDto or ParentEvaluationDto). */
public interface EvaluationView {
}

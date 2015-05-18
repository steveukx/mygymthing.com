define([
    './WorkoutTarget'
], function (
    WorkoutTarget
) {

    'use strict';

    /**
     *
     *
     * @constructor
     * @name Workout
     */
    function Workout () {
        this.targets = WorkoutTarget.allTargets();
    }

    Workout.prototype.hasTargets = function () {
        return this.targets.some(function (target) {
            return target.selected;
        });
    };

    Workout.prototype.load = function () {
        var workout = this;
        return xhr.get('/workouts/history?target=' + this.muscleGroups.join(',')).then(function (data) {
            workout.history = data;
            return workout;
        });
    };

    Workout.prototype.start = function () {
        var workout = this;
        return new Promise(function (resolve, reject) {
            var targets = workout.targets = workout.targets.filter(WorkoutTarget.filterSelected);
            if (!targets.length) {
                reject(new Error("No selected targets"));
            }
            else {
                resolve(workout);
            }
        });
    };

    return Workout;

});

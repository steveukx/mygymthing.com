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
        this.history = [];
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

    /**
     * Starts the workout, when no targets are selected will reject the returned promise.
     *
     * @returns {*|Promise}
     */
    Workout.prototype.start = function () {
        var workout = this;

        return new Promise(function (resolve, reject) {
            var targets = workout.targets = workout.targets.filter(WorkoutTarget.filterSelected);
            if (!targets.length) {
                return reject("No selected targets");
            }

            getPreviousWorkouts(workout)
                .then(resolve);
        });
    };

    /**
     * TODO: should fetch a list of available previous workouts to start from
     *
     * @param {Workout} workout
     * @returns {Promise}
     */
    function getPreviousWorkouts (workout) {
        workout.history = [];
        return Promise.resolve(workout);
    }

    return Workout;

});

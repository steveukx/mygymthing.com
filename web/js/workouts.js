define([
    'util/dom',
    'widgets/dialog',
    'domain/Workout',
    'text!fragments/create-workout-dialog.html',
    'text!fragments/select-workout-dialog.html',
    'text!fragments/start-workout.html'
], /** @exports workouts */ function (
    dom,
    dialog,
    Workout,
    createWorkoutTemplate,
    selectWorkoutTemplate,
    startWorkoutTemplate
) {

    dom('[data-action="start"]').on('click', function (e) {
        var workout = new Workout();

        dialog(workout, 'Create Workout')
            .buttons(
                {text: 'Cancel', action: 'cancel'},
                {text: 'Start', action: 'start'}
            )
            .showModal(createWorkoutTemplate)
            .on('start', function (workout) {
                workout
                    .start()
                    .catch(onError)
                    .then(showWorkoutPicker)
                    .then(startWorkout);
            });
    });

    function startWorkout (workout) {
        console.log(workout);

        dom('.workout-content')
            .html(startWorkoutTemplate)
            .model(workout);
    }

    function showWorkoutPicker (workout) {
        return new Promise(function (resolve, reject) {
            if (!workout.history.length) {
                return resolve(workout);
            }

            dialog(workout, 'Select starting point')
                .buttons(
                    {text: 'Cancel', action: 'cancel'},
                    {text: 'Existing', action: 'existing'},
                    {text: 'Start New', action: 'new'}
                )
                .showModal(selectWorkoutTemplate)
                .on('cancel', reject)
                .on('new', resolve)
                .on('existing', function () {
                    // TODO
                    reject("Sorry, reusing an existing workout currently not supported");
                });
        });
    }

    function onError (error) {
        if (error) {
            dialog.alert(error, 'Oops!');
        }
    }

});

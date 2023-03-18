import { Injectable } from '@angular/core';
import { Score, Stats } from '../statistic';
import { ClassesService } from './classes.service';
import { ControlUIService } from './control-ui.service';
import { colorScore } from '../utils';
import {Phase} from "../Components/Classification/surgical-phase/phase";

export interface SelectedScore {
  score: Score;
  description: string;
}
@Injectable({
  providedIn: 'root',
})
export class ScoresService {
  scores: Array<Score>;
  video_scores: Array<Score>;
  isMulti : boolean;
  isSelectedOne: boolean = false;
  isSelectedVideo: boolean = false;
  isOneUpdate: boolean = false;
  canBuild: boolean = true;
  listPhasePrediction: Array<Phase>;
  listPhaseGt: Array<Phase>;
  segment_arr_pred : Array<number>;
  segment_arr_label : Array<number>;
  nFrames: number;
  videos : Array<number> = [];
  selectedVideo: number;
  selectedFile: string;
  overall_acc: Array<number> = [];
  videoMap : Map<number, number>;
  micro_overall_acc : number;
  final_multi_result: Map<number, Array<Score>>;
  visibleScores: Array<boolean>;
  confusionMatrix: Array<Array<number>>;
  stateCMatrix: Array<Array<string>>;
  oneOverlapScore: Array<number> = [];
  final_pred_array: Map<number, Array<number>>;
  final_label_array: Map<number, Array<number>>;
  predictionArray: Array<number> = [];
  groundtruthArray: Array<number> = [];
  selectedScores: Array<SelectedScore> = new Array<SelectedScore>();

  constructor(
      private classService: ClassesService,
      private UICtrlService: ControlUIService,
  ) {
  }

  getScores() {
    return this.scores;
  }

  colorScore(score:number|undefined){
    return colorScore(score);
  }

  setScores(scores: Array<Score>) {
    if(this.isSelectedOne) {
      this.video_scores = scores;
    } else {
      this.scores = scores;
    }
    this.visibleScores = new Array<boolean>(this.scores.length).fill(true);
  }

  updateScore(overlap_score: number[]) {
    let statsComputer = new Stats(
        this.confusionMatrix,
        this.UICtrlService.ignoreFirstClassMetric
    );

    let newScores = statsComputer.updateScore(overlap_score, this.overall_acc, this.micro_overall_acc, this.UICtrlService.showNaN);
    if (this.scores) {
      let existingScoresNames: Array<string> = this.scores.map<string>(
          (element) => {
            return element.name;
          }
      );
      for (let i = 0; i < newScores.length; i++) {
        let name: string = newScores[i].name;
        let indexOf = existingScoresNames.indexOf(name);
        if (indexOf >= 0) {
          this.scores[indexOf].update(newScores[i]);
        } else {
          this.scores.push(newScores[i]);
        }
      }
      this.setScores(this.scores);
    } else {
      this.setScores(newScores);
    }
  }
  onToggleChange() {
    if(!this.isMulti) {
      this.updateScore(this.oneOverlapScore);
    } else {
      let pred = this.final_pred_array.get(this.selectedVideo) || [];
      let gt = this.final_label_array.get(this.selectedVideo) || [];
      this.isOneUpdate = true;
      this.updateConfusionMatrixFromArrayMultiVideos(pred, gt, this.selectedVideo, this.final_multi_result.size);
    }
  }

  calculateMultiScore(overlap_score: number[], i: number, video_count : number) {
    for(let i=0; i<video_count; i++) {
      this.videos[i] = i;
    }
    let statsComputer = new Stats(
        this.confusionMatrix,
        this.UICtrlService.ignoreFirstClassMetric
    );
    let newScores = statsComputer.updateScore(overlap_score, this.overall_acc, this.micro_overall_acc, this.UICtrlService.showNaN);
    this.final_multi_result.set(i, newScores);

    if (this.final_multi_result.size == video_count) {
      this.updateMultiScore(video_count);
      if(this.isOneUpdate) { //if one video update
        let score = this.final_multi_result.get(i) || [];
        this.fillOneMetricTable(score);
        this.isOneUpdate = false;
      }
    }
  }

  //holds aggregated result for dataset level
  updateMultiScore(video_count : number) {
    this.isSelectedOne = false; // for setScores method
    let myScores = new Array<Score>();

    let micro_result = this.calculateMicroAverage(video_count);
    let macro_res = this.calculateMacroAverage(video_count);

    let item = this.final_multi_result.get(0) || [];
    for(let i=0; i<item.length; i++) {
      let args = {
        name: item[i].name,
        ...(micro_result.get(item[i].name) && {microAverage: micro_result.get(item[i].name) }),
        ...(macro_res.get(item[i].name) && { macroAverage: macro_res.get(item[i].name) })
      };

      myScores.push(new Score(args));
    }
    this.fillMetricTable(myScores);
  }

  calculateMicroAverage(video_count : number) {
    let macroMap = new Map<string, number>();
    let newMap = new Map<string, number>();
    for(let i=0; i<video_count; i++) {
      let item = this.final_multi_result.get(i) || [];
      for(let i=0; i<item.length; i++) {
        if(macroMap.has(item[i].name)) {
          let num = macroMap.get(item[i].name);
          if(num !== undefined) {
            macroMap.set(item[i].name, num + item[i].microAverage);
          }
        } else {
          macroMap.set(item[i].name, item[i].microAverage);
        }
      }
    }
    macroMap.forEach((value, key) => {
      newMap.set(key, value / video_count);
    });
    return newMap;
  }

  calculateMacroAverage(video_count : number) {
    let macroMap = new Map<string, number>();
    let newMap = new Map<string, number>();
    let macro_precision = new Map<number, [number, number]>();
    let macro_recall = new Map<number, [number, number]>();
    let macro_acc = 0;
    for(let i=0; i<video_count; i++) {
      let item = this.final_multi_result.get(i) || [];
      for(let i=0; i<item.length; i++) {
        if(item[i].name == 'Precision') {
          let vd_count = video_count;
          this.calculateMacroAll(item[i].perClassScore, macro_precision, vd_count);
        }
        if(item[i].name == 'Sensitivity') {
          let vd_count = video_count;
          this.calculateMacroAll(item[i].perClassScore, macro_recall, vd_count);
        }
        if(item[i].name == 'Accuracy') macro_acc += item[i].microAverage;
        if(macroMap.has(item[i].name) && item[i].name != 'Precision' && item[i].name != 'Sensitivity') {
          let num = macroMap.get(item[i].name);
          if(num !== undefined) {
            macroMap.set(item[i].name, num +item[i].macroAverage);
          }
        } else {
          macroMap.set(item[i].name, item[i].macroAverage);
        }
      }
    }
    macroMap.forEach((value, key) => {
      newMap.set(key, value / video_count);
    });
    let macro_precision_average = Array.from(macro_precision.values())
        .reduce((acc, val) => acc + val[1]/val[0], 0) / macro_precision.size;

    let macro_recall_average = Array.from(macro_recall.values())
        .reduce((acc, val) => acc + val[1]/val[0], 0) / macro_recall.size;

    newMap.set('Precision', macro_precision_average);
    newMap.set('Sensitivity', macro_recall_average);

    return newMap;
  }

  //first index: video_count, second index: total value for each video
  calculateMacroAll(perClassScores: Array<number>, map: Map<number, [number, number]>, video_count: number) {
    for(let j=0; j < perClassScores.length; j++) {
      if (map.has(j)) {
        let num = map.get(j);
        if(isNaN(perClassScores[j])) {
          if(num) map.set(j, [num[0]-1, num[1]]);
        } else {
          if(num) map.set(j, [num[0], num[1] + perClassScores[j]]);
        }
      } else {
        if(isNaN(perClassScores[j])) {
          map.set(j, [video_count-1, 0]);
        } else {
          map.set(j, [video_count, perClassScores[j]]);
        }
      }
    }
  }

  fillMetricTable(myScores: Array<Score>) {
    if (this.scores) {
      let existingScoresNames: Array<string> = this.scores.map<string>(
          (element) => {
            return element.name;
          }
      );
      for (let i = 0; i < myScores.length; i++) {
        let name: string = myScores[i].name;
        let indexOf = existingScoresNames.indexOf(name);
        if (indexOf >= 0) {
          this.scores[indexOf].update(myScores[i]);
        } else {
          this.scores.push(myScores[i]);
        }
      }
      this.setScores(this.scores);
    } else {
      this.setScores(myScores);
    }
  }

  //for one video table result
  fillOneMetricTable(myScores: Array<Score>) {
    this.isSelectedOne = true;
    if (this.video_scores) {
      let existingScoresNames: Array<string> = this.video_scores.map<string>(
          (element) => {
            return element.name;
          }
      );
      for (let i = 0; i < myScores.length; i++) {
        let name: string = myScores[i].name;
        let indexOf = existingScoresNames.indexOf(name);
        if (indexOf >= 0) {
          this.video_scores[indexOf].update(myScores[i]);
        } else {
          this.video_scores.push(myScores[i]);
        }
      }
      this.setScores(this.video_scores);
    } else {
      this.setScores(myScores);
    }
  }

  initConfMat() {
    this.confusionMatrix = new Array(this.classService.classes.length).fill(0);
    for (var i = 0; i < this.confusionMatrix.length; i++) {
      this.confusionMatrix[i] = new Array(
          this.classService.classes.length
      ).fill(0);
    }
    this.updateStateMatrix();
  }

  updateStateMatrix() {
    this.stateCMatrix = new Array<Array<string>>();

    for (let i = 0; i < this.classService.classes.length; i++) {
      let row = new Array<string>();
      for (let j = 0; j < this.classService.classes.length; j++) {
        let val = 'TN';
        if (i == this.classService.currentClass) {
          val = 'FP';
        }
        if (j == this.classService.currentClass) {
          val = 'FN';
        }
        if (
            j == this.classService.currentClass &&
            i == this.classService.currentClass
        ) {
          val = 'TP';
        }
        row.push(val);
      }
      this.stateCMatrix.push(row);
    }
  }
  computeConfMatFromArray(
      pred: Array<number>,
      gt: Array<number>,
      confMat: Array<Array<number>>
  ) {
    let min_length = Math.min(pred.length, gt.length)
    for (let i = 0; i < min_length; i++) {
      let c_pred = pred[i];
      let c_gt = gt[i];
      confMat[c_pred][c_gt] += 1;
    }
  }
  updateConfusionMatrixFromArray(pred: Array<number>, gt: Array<number>) {
    this.initConfMat();
    this.computeConfMatFromArray(pred, gt, this.confusionMatrix);
    this.predictionArray = pred;
    this.groundtruthArray = gt;
    this.micro_overall_acc = Stats.micro_overall_acc(gt, pred);
    this.oneOverlapScore = Stats.calculateOverlap(gt, pred);
    this.updateScore(this.oneOverlapScore);
  }

  updateConfusionMatrixFromArrayMultiVideos(pred: Array<number>, gt: Array<number>, i:number, video_count : number) {
    this.initConfMat();
    this.computeConfMatFromArray(pred, gt, this.confusionMatrix);
    this.micro_overall_acc  = Stats.micro_overall_acc(gt, pred);
    let overlap_scores = Stats.calculateOverlap(gt, pred);
    this.calculateMultiScore(overlap_scores, i, video_count);
  }

  buildPhaseSetup(prediction: Array<number>, label: Array<number>) {
    this.listPhasePrediction = new Array<Phase>(new Set(prediction).size);
    this.listPhaseGt = new Array<Phase>(new Set(label).size);

    var prediction_segments = this.segmentArrayPhase(prediction);
    var label_segments = this.segmentArrayPhase(label);
    let n_pred_samples = prediction_segments.length;
    let previous = null;
    let index = 0;
    for (let i = 0; i < n_pred_samples; i++) {
      let width_pred = prediction_segments[i].length;
      previous = {
        start: index,
        width: width_pred,
        label: prediction_segments[i][0],
        next: null,
        previous: previous,
        exists: true,
      };

      this.listPhasePrediction[i] = previous;
      if (i > 0) {
        this.listPhasePrediction[i - 1].next = previous;
      }
      index = index + width_pred;
    }
    previous = null;
    let n_label_samples = label_segments.length;
    let label_index = 0;
    for (let i = 0; i < n_label_samples; i++) {
      let width_label = label_segments[i].length;
      previous = {
        start: label_index,
        width: width_label,
        label: label_segments[i][0],
        next: null,
        previous: previous,
        exists: true,
      };
      this.listPhaseGt[i] = previous;
      if (i > 0) {
        this.listPhaseGt[i - 1].next = previous;
      }
      label_index = label_index + width_label;
    }
    const uniquePredCount = new Set(prediction).size;
    const uniqueLabelCount = new Set(label).size;
    const uniqueCount = Math.max(uniquePredCount, uniqueLabelCount)
    this.classService.setClasses([...Array(uniqueCount).keys()]);
    this.classService.setCurrentClass(0);
    /*if(!this.isMulti) {
      this.initConfMat();
      this.updateVideoScore();
    }*/
  }

  updateVideoScore() {
    if (this.classService.classes) {
      this.updateListPhase();

      var predicted = new Array<number>(this.nFrames);
      var groundtruth = new Array<number>(this.nFrames);

      var phasePredicted = this.listPhasePrediction[0];
      var phaseGt = this.listPhaseGt[0];
      let pred_label = phasePredicted.label;
      let gt_label = phaseGt.label;
      let pred_step = phasePredicted.width;
      let gt_step = phaseGt.width;
      let j = 0;
      let gt = 0;

      for (let i = 0; i < this.nFrames; i++) {
        predicted[i] = pred_label;
        j += 1;

        if(phasePredicted.next && j >= pred_step) {
          phasePredicted = phasePredicted.next;
          pred_label = phasePredicted.label;
          pred_step = phasePredicted.width;
          j = 0;
        }
      }
      for (let i = 0; i < this.nFrames; i++) {
        groundtruth[i] = gt_label;
        gt += 1;

        if(phaseGt.next && gt >= gt_step) {
          phaseGt = phaseGt.next;
          gt_label = phaseGt.label;
          gt_step = phaseGt.width;
          gt = 0;
        }
      }
      this.segment_arr_pred = [];
      this.segment_arr_label = [];
      this.segment_arr_pred = predicted;
      this.segment_arr_label = groundtruth;

      this.updateConfusionMatrixFromArray(this.segment_arr_pred, this.segment_arr_label);
    }
  }

  updateListPhase() {
    this.listPhasePrediction = this.listPhasePrediction.filter((element) => {
      return element.exists;
    });
    this.listPhaseGt = this.listPhaseGt.filter((element) => {
      return element.exists;
    });
  }

  segmentArrayPhase(array: number[]) {
    let segments: any[] = [];
    let currentSegment: any[] = [array[0]];

    for (let i = 1; i < array.length; i++) {
      if (array[i] === array[i - 1]) {
        currentSegment.push(array[i]);
      } else {
        segments.push(currentSegment);
        currentSegment = [array[i]];
      }
    }
    segments.push(currentSegment);
    return segments;
  }

}
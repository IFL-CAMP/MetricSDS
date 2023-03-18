import { Component, Input, OnInit } from '@angular/core';
import { ControlUIService } from 'src/app/Services/control-ui.service';

@Component({
  selector: 'app-tooltips',
  templateUrl: './tooltips.component.html',
  styleUrls: ['./tooltips.component.scss']
})
export class TooltipsComponent implements OnInit {

  @Input() type: string
  precision = '$$ \\text{precision} = \\frac{TP}{TP+FP} $$'
  accuracy = '$$ \\text{accuracy} = \\frac{TP + TN}{TP + TN + FP + FN} $$'
  microF1 = '$$ \\text{F1} = \\frac{\\text{2$\\times$Precision$\\times$Sensitivity }}{\\text{Precision + Sensitivity}} $$'
  macroF1Score = '$$ \\text{Macro F1} = \\frac{1}{K} \\sum_{i=1}^{K} \\frac{\\text{2} \\times \\text{Precision}_i \\times \\text{Sensitivity}_i}{\\text{Precision}_i + \\text{Sensitivity}_i} $$'

  macroF1 = '$$ \\text{Macro F1} = \\frac{1}{K} \\sum_{i=1}^{K} {F}_{i} $$'
  overallAccuracy = '$$ \\text{accuracy} = \\frac{\\text{Number of correct predictions}}{\\text{Total number of predictions}} $$'
  specificity = '$$ \\text{specificity} = \\frac{TN}{TN+FP} $$'
  sensitivity = '$$ \\text{sensitivity} = \\frac{TP}{TP+FN} $$'

  iou = '\\begin{align*} \\text{IoU} &= \\frac{|P \\cap G| }{ |P \\cup G|} \\\\ \\text{IoU} &= \\frac{TP}{TP + FP + TN} \\end{align*}'
  overlapScore  = '$$ \\text{Overlap Score } = \\frac{1}{N} \\sum_{i=1}^{N} \\max_{j} \\frac{\\left| y_i \\cap \\hat{y_j}\\right|}{\\left| y_i \\cup \\hat{y_j}\\right|} $$'
  kappa = '$$ \\kappa = \\frac{p_{agree} - p_{chance}}{1 - p_{chance}}$$'
  mcc1 = '$$ \\text{MCC} = \\frac{\\sum_{i=1}^K \\sum_{j=1}^K n_{ij} n_{ji} - \\sum_{i=1}^K n_i^2}{\\sqrt{\\left(\\sum_{i=1}^K \\sum_{j=1}^K n_{ij}\\right)\\left(\\sum_{i=1}^K \\sum_{j=1}^K n_{ji}\\right) - \\sum_{i=1}^K n_i^2}}$$'

  mcc = '$$ \\text{MCC} = \\frac{\\text{c} \\times \\text{s} - \\sum_{k}^K p_{k} \\times t_{k}}{\\sqrt{(s^2 - \\sum_{k}^K p^2_{k})(s^2 - \\sum_{k}^K t^2_{k})}} $$'
  c = '$$ \\text{c} = \\sum_{k}^K C_{kk} \\hspace{0.2cm} \\text{the total number of elements correctly predicted} $$'
  s = '$$ \\text{s} = \\sum_{i}^K \\sum_{j}^K C_{ij} \\hspace{0.2cm} \\text{the total number of elements} $$'
  p = '$$ \\hspace{0.2cm} \\text{p}_{k} = \\sum_{i}^K C_{ki} \\hspace{0.2cm} \\text{the number of times that class k was predicted (column total)} $$'
  t = '$$ \\hspace{0.2cm} \\text{t}_{k} = \\sum_{i}^K C_{ik} \\hspace{0.2cm} \\text{the number of times that class k truly occurred (row total)} $$'

  groundTruth = '$$ \\mathbf{y} = \\begin{bmatrix} y_{1}, y_{2}, .... , y_{n} \\end{bmatrix} $$'

  prediction = '$$ \\mathbf{\\hat{y}} = \\begin{bmatrix} \\hat{y}_{1}, \\hat{y}_{2}, .... , \\hat{y}_{n} \\end{bmatrix} $$'
  constructor(public controlUIService: ControlUIService) { }

  ngOnInit(): void {
  }


}

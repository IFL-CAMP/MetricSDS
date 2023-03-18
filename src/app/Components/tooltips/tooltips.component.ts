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
  microF1 = '$$ \\text{Micro F1} = \\frac{\\text{2$\\times$Micro Precision$\\times$Micro Sensitivity }}{\\text{Micro Precision + Micro Sensitivity}} $$'
  macroF1 = '$$ \\text{Macro F1} = \\frac{1}{K} \\sum_{i=1}^{K} \\frac{\\text{2} \\times \\text{Precision}_i \\times \\text{Sensitivity}_i}{\\text{Precision}_i + \\text{Sensitivity}_i} $$'

  overallAccuracy = '$$ \\text{accuracy} = \\frac{\\text{Number of correct predictions}}{\\text{Total number of predictions}} $$'
  specificity = '$$ \\text{specificity} = \\frac{TN}{TN+FP} $$'
  sensitivity = '$$ \\text{sensitivity} = \\frac{TP}{TP+FN} $$'

  iou = '\\begin{align*} \\text{IoU} &= \\frac{|P \\cap G| }{ |P \\cup G|} \\\\ \\text{IoU} &= \\frac{TP}{TP + FP + TN} \\end{align*}'
  overlapScore  = '$$ \\text{Overlap Score } = \\frac{1}{N} \\sum_{i=1}^{N} \\max_{j} \\frac{\\left| y_i \\cap \\hat{y_j}\\right|}{\\left| y_i \\cup \\hat{y_j}\\right|} $$'
  kappa = '$$ \\kappa = \\frac{p_{agree} - p_{chance}}{1 - p_{chance}}$$'
  mcc = '$$ \\frac{\\sum_{i=1}^K \\sum_{j=1}^K n_{ij} n_{ji} - \\sum_{i=1}^K n_i^2}{\\sqrt{\\left(\\sum_{i=1}^K \\sum_{j=1}^K n_{ij}\\right)\\left(\\sum_{i=1}^K \\sum_{j=1}^K n_{ji}\\right) - \\sum_{i=1}^K n_i^2}}$$'

  constructor(public controlUIService: ControlUIService) { }

  ngOnInit(): void {
  }


}
